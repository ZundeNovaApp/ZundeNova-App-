import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

const router: Router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const customToken = await admin.auth().createCustomToken(userRecord.uid, {
        role: user.role
      });

      const token = jwt.sign(
        { 
          uid: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (firebaseError) {
      console.error('Firebase auth error:', firebaseError);
      res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export { router as authLoginRoutes };
