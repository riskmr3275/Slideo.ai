import { Request, Response } from 'express';
import {
  sendEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendPresentationSharedEmail,
  sendAccountDeletedEmail,
} from '../services/emailService';

/** POST /api/email/test — send a raw test email (development only) */
export const testEmail = async (req: Request, res: Response): Promise<void> => {
  const { to } = req.body;
  if (!to) {
    res.status(400).json({ error: '`to` email address is required' });
    return;
  }
  try {
    await sendEmail(
      to,
      '✅ Slideo.ai — Email service is working!',
      `<p style="font-family:sans-serif;font-size:16px;">
         🎉 Your email service is configured correctly!
       </p>`
    );
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send test email', details: err.message });
  }
};

/** POST /api/email/send-welcome */
export const sendWelcome = async (req: Request, res: Response): Promise<void> => {
  const { to, name } = req.body;
  if (!to || !name) {
    res.status(400).json({ error: '`to` and `name` fields are required' });
    return;
  }
  try {
    await sendWelcomeEmail(to, name);
    res.json({ success: true, message: `Welcome email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send welcome email', details: err.message });
  }
};

/** POST /api/email/send-otp */
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  const { to, otp, expiryMinutes } = req.body;
  if (!to || !otp) {
    res.status(400).json({ error: '`to` and `otp` fields are required' });
    return;
  }
  try {
    await sendOTPEmail(to, otp, expiryMinutes ?? 10);
    res.json({ success: true, message: `OTP email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send OTP email', details: err.message });
  }
};

/** POST /api/email/send-password-reset */
export const sendPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { to, resetUrl, expiryMinutes } = req.body;
  if (!to || !resetUrl) {
    res.status(400).json({ error: '`to` and `resetUrl` fields are required' });
    return;
  }
  try {
    await sendPasswordResetEmail(to, resetUrl, expiryMinutes ?? 30);
    res.json({ success: true, message: `Password reset email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send password reset email', details: err.message });
  }
};

/** POST /api/email/send-presentation-shared */
export const sendPresentationShared = async (req: Request, res: Response): Promise<void> => {
  const { to, senderName, presentationTitle, shareUrl } = req.body;
  if (!to || !senderName || !presentationTitle || !shareUrl) {
    res.status(400).json({
      error: '`to`, `senderName`, `presentationTitle`, and `shareUrl` are required',
    });
    return;
  }
  try {
    await sendPresentationSharedEmail(to, senderName, presentationTitle, shareUrl);
    res.json({ success: true, message: `Shared-presentation email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to send presentation-shared email',
      details: err.message,
    });
  }
};

/** POST /api/email/send-account-deleted */
export const sendAccountDeleted = async (req: Request, res: Response): Promise<void> => {
  const { to, name } = req.body;
  if (!to || !name) {
    res.status(400).json({ error: '`to` and `name` fields are required' });
    return;
  }
  try {
    await sendAccountDeletedEmail(to, name);
    res.json({ success: true, message: `Account-deleted email sent to ${to}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send account-deleted email', details: err.message });
  }
};
