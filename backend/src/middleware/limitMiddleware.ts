import { Response, NextFunction } from 'express';
import { Plan } from '@prisma/client';
import { prisma } from '../index';
import { AuthRequest } from './auth';

export const checkLimits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User record missing' });
    }

    // Reset monthly usage if needed
    const now = new Date();
    const lastReset = new Date(user.lastUsageReset);
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          presentationsCreatedThisMonth: 0,
          lastUsageReset: now,
        },
      });
      user.presentationsCreatedThisMonth = 0;
    }

    // Check presentation limit
    if (user.plan === Plan.FREE && user.presentationsCreatedThisMonth >= 5) {
      return res.status(403).json({
        error: 'Monthly limit reached',
        limit: 5,
        current: user.presentationsCreatedThisMonth,
        upgradeRequired: true,
      });
    }

    // Add user object with plan to request for downstream usage
    (req as any).userPlan = user;

    next();
  } catch (error) {
    console.error('Limit check error:', error);
    res.status(500).json({ error: 'Internal server error during limit check' });
  }
};

export const checkSlideCountLimit = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = (req as any).userPlan;
  if (!user) return next();

  // Only enforce limits when AI is generating (topic-based), not for manual/template slides
  const slides = req.body.slides;
  const isManualSlides = Array.isArray(slides);

  if (isManualSlides) {
    // For manual/template slides, cap the array to the plan limit silently
    const limit = user.plan === 'FREE' ? 10 : user.plan === 'PRO' ? 50 : 200;
    if (slides.length > limit) {
      req.body.slides = slides.slice(0, limit);
    }
    return next();
  }

  // For AI generation, cap slideCount to plan limit
  const requestedCount = parseInt(req.body.slideCount as string, 10) || 5;
  const limit = user.plan === 'FREE' ? 10 : user.plan === 'PRO' ? 50 : 200;

  if (requestedCount > limit) {
    // Silently cap to the plan limit instead of blocking
    req.body.slideCount = String(limit);
  }

  next();
};
