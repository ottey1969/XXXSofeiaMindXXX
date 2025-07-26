import { Router } from 'express';
import { authService } from '../auth';
import { emailService } from '../services/emailService';
import { z } from 'zod';

const router = Router();

// Register/login with email
router.post('/register', async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email('Invalid email address')
    }).parse(req.body);

    // Check if user already exists
    const existingUser = await authService.getUserByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified) {
        // User is already verified, log them in directly
        (req.session as any).userId = existingUser.id;
        return res.json({
          message: 'Email already registered and verified',
          userId: existingUser.id,
          email: existingUser.email,
          emailVerified: true,
          credits: existingUser.credits,
          autoLogin: true
        });
      }
      
      // Set session to log existing user in immediately  
      (req.session as any).userId = existingUser.id;
      
      return res.json({
        message: `Welcome back! You have ${existingUser.credits} credits remaining.`,
        userId: existingUser.id,
        email: existingUser.email,
        credits: existingUser.credits,
        autoLogin: true
      });
    }

    // Get client IP address
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
    
    const user = await authService.registerUser(email, clientIP);
    
    // Set session to log user in immediately
    (req.session as any).userId = user.id;
    
    res.json({
      message: 'Registration complete! You can start creating content with your 3 free credits.',
      userId: user.id,
      email: user.email,
      autoLogin: true
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
});

// Admin verification endpoint (for manual verification via WhatsApp)
router.post('/verify', async (req, res) => {
  try {
    const { email, adminKey } = z.object({
      email: z.string().email(),
      adminKey: z.string()
    }).parse(req.body);

    // Check admin key
    if (adminKey !== '0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb') {
      return res.status(403).json({ message: 'Unauthorized admin access' });
    }

    const user = await authService.verifyUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User verified successfully',
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        emailVerified: user.emailVerified
      }
    });
  } catch (error: any) {
    console.error('Admin verification error:', error);
    res.status(400).json({ 
      message: error.message || 'Verification failed' 
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      credits: user.credits,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session?.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;