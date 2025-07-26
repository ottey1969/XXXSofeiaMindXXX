import { Router } from 'express';
import { authService } from '../auth';
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
      return res.json({
        message: 'New verification email sent to existing account',
        userId: existingUser.id,
        // verificationToken removed for security
        email: existingUser.email
      });
    }

    const { user, verificationToken } = await authService.registerUser(email);
    
    // In a real app, you'd send this via email
    // For demo purposes, we'll return it in the response
    res.json({
      message: 'Verification email sent',
      userId: user.id,
      // verificationToken removed for security
      email: user.email
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

    const user = await authService.verifyEmail(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

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