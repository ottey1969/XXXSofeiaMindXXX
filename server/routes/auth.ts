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
      // Generate new verification token for existing user
      const { verificationToken } = await authService.generateVerificationToken(existingUser.id);
      
      // Send verification email
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const emailSent = await emailService.sendVerificationEmail(email, verificationToken, baseUrl);
      
      return res.json({
        message: emailSent 
          ? 'New verification email sent to existing account'
          : 'Email service not configured. Contact support for manual verification.',
        userId: existingUser.id,
        email: existingUser.email,
        emailSent
      });
    }

    const { user, verificationToken } = await authService.registerUser(email);
    
    // Send verification email
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const emailSent = await emailService.sendVerificationEmail(email, verificationToken, baseUrl);
    
    res.json({
      message: emailSent 
        ? 'Verification email sent! Please check your inbox.'
        : 'Email service not configured. Contact support for manual verification.',
      userId: user.id,
      email: user.email,
      emailSent,
      // Temporary: For demo purposes, include verification token when email service is not configured
      ...((!emailSent && process.env.NODE_ENV === 'development') ? { verificationToken } : {})
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
});

// Verify email
router.post('/verify', async (req, res) => {
  try {
    const { token } = z.object({
      token: z.string()
    }).parse(req.body);

    console.log('Verification attempt with token:', token?.substring(0, 8) + '...');

    // Check if token exists in database
    const tokenCheck = await authService.getUserByVerificationToken(token);
    console.log('Token check result:', tokenCheck ? 'Found user' : 'No user found');

    const user = await authService.verifyEmail(token);
    if (!user) {
      console.log('No user found for token, token may be invalid or expired');
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    console.log('User verified successfully:', user.email);

    // Set session
    (req.session as any).userId = user.id;
    
    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        emailVerified: user.emailVerified
      }
    });
  } catch (error: any) {
    console.error('Verification error:', error);
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