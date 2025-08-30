import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router: Router = Router();

router.use(authenticateToken);

router.get('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.uid },
      include: {
        farms: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.uid },
      data: {
        name,
        phone,
        profileImage
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export { router as userRoutes };
