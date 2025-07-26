import { Router } from 'express';
import { authService } from '../auth';
import { z } from 'zod';

const router = Router();

// Admin authentication with secure key
const ADMIN_KEY = process.env.ADMIN_KEY || '0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb';

const requireAdmin = (req: any, res: any, next: any) => {
  const adminKey = req.headers['x-admin-key'] || req.body.adminKey || req.query.adminKey;
  
  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Add credits to user by email
router.post('/add-credits', requireAdmin, async (req, res) => {
  try {
    const { email, credits } = z.object({
      email: z.string().email('Invalid email address'),
      credits: z.number().min(1, 'Credits must be at least 1').max(100, 'Maximum 100 credits at once'),
      adminKey: z.string().optional() // Allow admin key in body
    }).parse(req.body);

    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await authService.addCredits(user.id, credits);
    
    res.json({
      message: `Added ${credits} credits to ${email}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        credits: updatedUser.credits
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Failed to add credits' 
    });
  }
});

// Get user info by email
router.get('/user/:email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      credits: user.credits,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to get user' 
    });
  }
});

// List all users (with pagination)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    // This would need to be implemented in the auth service
    // For now, return a simple message
    res.json({ 
      message: 'User listing not implemented yet. Use /admin/user/:email to get specific user info.' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to list users' 
    });
  }
});

export default router;