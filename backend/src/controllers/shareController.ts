import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendPresentationSharedEmail } from '../services/emailService';
import crypto from 'crypto';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ── POST /api/share/:presentationId ──────────────────────────────────────────
export const createShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { presentationId } = req.params;
    const userId = (req as any).user?.id;
    const userEmail = (req as any).user?.email;
    const { recipientEmail, permission = 'view', expiryHours = 24 } = req.body;

    if (!recipientEmail) {
      res.status(400).json({ error: '`recipientEmail` is required' });
      return;
    }

    // Verify the requesting user owns the presentation
    const presentation = await prisma.presentation.findFirst({
      where: { id: String(presentationId), userId: String(userId) },
    });
    if (!presentation) {
      res.status(404).json({ error: 'Presentation not found or access denied' });
      return;
    }

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // @ts-ignore
    await prisma.shareToken.create({
      data: {
        presentationId: String(presentationId),
        token,
        recipientEmail,
        permission: String(permission),
        expiresAt,
      },
    });

    const shareUrl = `${FRONTEND_URL}/share/${token}`;

    // Fire invitation email — non-blocking
    const senderName = userEmail || 'A Slideo.ai user';
    sendPresentationSharedEmail(recipientEmail, senderName, presentation.title, shareUrl, permission)
      .catch((err: Error) =>
        console.error('[ShareController] Failed to send share email:', err.message)
      );

    res.status(201).json({
      success: true,
      shareUrl,
      token,
      expiresAt,
      permission,
    });
  } catch (error: any) {
    console.error('[ShareController] createShareLink error:', error);
    res.status(500).json({ error: 'Failed to create share link', details: error.message });
  }
};

// ── GET /api/share/resolve/:token ─────────────────────────────────────────────
export const resolveShareToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // @ts-ignore
    const shareToken = await (prisma.shareToken as any).findUnique({
      where: { token: String(token) },
      include: { presentation: { select: { id: true, title: true } } },
    });

    if (!shareToken) {
      res.status(404).json({ error: 'Share link not found or has already been used' });
      return;
    }

    if (new Date() > shareToken.expiresAt) {
      res.status(410).json({ error: 'This share link has expired' });
      return;
    }

    res.json({
      presentationId: shareToken.presentationId,
      presentationTitle: (shareToken as any).presentation?.title || 'Untitled',
      permission: shareToken.permission,
      recipientEmail: shareToken.recipientEmail,
      expiresAt: shareToken.expiresAt,
    });
  } catch (error: any) {
    console.error('[ShareController] resolveShareToken error:', error);
    res.status(500).json({ error: 'Failed to resolve share token', details: error.message });
  }
};

// ── GET /api/presentations/:id/shared?token=... ──────────────────────────────
export const getSharedPresentation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const token = req.query.token as string;

    if (!token) {
      res.status(401).json({ error: 'Share token required' });
      return;
    }

    // @ts-ignore
    const shareToken = await prisma.shareToken.findUnique({ where: { token: String(token) } });

    if (!shareToken || shareToken.presentationId !== id) {
      res.status(404).json({ error: 'Invalid share token' });
      return;
    }

    if (new Date() > shareToken.expiresAt) {
      res.status(410).json({ error: 'This share link has expired' });
      return;
    }

    const presentation = await prisma.presentation.findUnique({
      where: { id: String(id) },
      include: {
        slides: {
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!presentation) {
      res.status(404).json({ error: 'Presentation not found' });
      return;
    }

    res.json({ ...presentation, permission: (shareToken as any).permission });
  } catch (error: any) {
    console.error('[ShareController] getSharedPresentation error:', error);
    res.status(500).json({ error: 'Failed to load presentation', details: error.message });
  }
};
