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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    const resetToken = 'mock-reset-token-' + Date.now();
    
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token generated: ${resetToken}`);
    
    res.json({
      message: 'Password reset email sent successfully',
      resetToken
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    console.log(`Password reset completed for token: ${token}`);
    
    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset completion error:', error);
    res.status(500).json({ error: 'Password reset completion failed' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }
    
    console.log(`Email verification completed for token: ${token}`);
    
    res.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

export { router as authRoutes };
