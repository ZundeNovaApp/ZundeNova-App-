import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { prisma } from '../config/database';
import { UserRole } from '@zundenova/shared';

const router: Router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    const user = await prisma.user.create({
      data: {
        id: userRecord.uid,
        email,
        name,
        phone,
        role: role.toUpperCase() as any
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

router.post('/set-role', async (req, res) => {
  try {
    const { uid, role } = req.body;

    await admin.auth().setCustomUserClaims(uid, { role });
    
    await prisma.user.update({
      where: { id: uid },
      data: { role: role.toUpperCase() as any }
    });

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(400).json({ error: 'Failed to update role' });
  }
});

export { router as authRoutes };
