import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const getUserPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        presentationsCreatedThisMonth: true,
        lastUsageReset: true,
      },
    });

    if (!user) return res.status(401).json({ error: 'Unauthorized: User record missing' });

    res.json(user);
  } catch (error) {
    console.error('Error fetching user plan:', error);
    res.status(500).json({ error: 'Failed to fetch user plan' });
  }
};
