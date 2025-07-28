import { Router } from 'express';
import { authService } from '../auth';
import { z } from 'zod';
import { db } from '../db';
import { notifications, insertNotificationSchema, broadcasts, announcements, insertBroadcastSchema, insertAnnouncementSchema, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

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

// Send notification to user
router.post('/send-notification', requireAdmin, async (req, res) => {
  try {
    const { email, title, message, type, expiresInHours } = z.object({
      email: z.string().email('Invalid email address'),
      title: z.string().min(1, 'Title is required'),
      message: z.string().min(1, 'Message is required'),
      type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
      expiresInHours: z.number().min(1).max(168).optional(), // Max 1 week
      adminKey: z.string().optional()
    }).parse(req.body);

    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const expiresAt = expiresInHours 
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      : null;

    const [notification] = await db.insert(notifications).values({
      userId: user.id,
      title,
      message,
      type,
      expiresAt
    }).returning();

    res.json({
      message: `Notification sent to ${email}`,
      notification: {
        id: notification.id,
        title: notification.title,
        type: notification.type,
        createdAt: notification.createdAt
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Failed to send notification' 
    });
  }
});

// List all users (with pagination)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { search, format } = req.query;
    
    let userQuery = db.select({
      id: users.id,
      email: users.email,
      credits: users.credits,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt
    }).from(users);

    // Apply search filter if provided
    if (search && typeof search === 'string') {
      userQuery = userQuery.where(sql`${users.email} ILIKE ${'%' + search + '%'}`);
    }

    const userList = await userQuery.orderBy(users.createdAt);

    // Handle export formats
    if (format === 'csv') {
      const csvData = [
        'Email,Credits,Email Verified,Created At',
        ...userList.map((user: any) => 
          `"${user.email}",${user.credits},${user.emailVerified},${user.createdAt}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users_export.csv"');
      return res.send(csvData);
    }

    if (format === 'emails') {
      const emailList = userList.map((user: any) => user.email).join('\n');
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="user_emails.txt"');
      return res.send(emailList);
    }

    // Default JSON response
    res.json({
      users: userList,
      total: userList.length,
      searchTerm: search || null
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      message: error.message || 'Failed to list users' 
    });
  }
});

// Delete all users (admin only)
router.delete('/reset-users', requireAdmin, async (req, res) => {
  try {
    const result = await authService.deleteAllUsers();
    console.log(`Admin deleted ${result.deletedCount} users`);
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Error deleting users:', error);
    res.status(500).json({ message: 'Failed to delete users' });
  }
});

// Create broadcast message to all users
router.post('/broadcast', requireAdmin, async (req, res) => {
  try {
    const { title, message, type = 'info', expiresInHours } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let expiresAt = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
    }

    const [broadcast] = await db
      .insert(broadcasts)
      .values({
        title,
        message,
        type,
        expiresAt
      })
      .returning();

    res.json({
      message: 'Broadcast sent to all users',
      broadcast: {
        id: broadcast.id,
        title: broadcast.title,
        type: broadcast.type,
        createdAt: broadcast.createdAt
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Failed to send broadcast' 
    });
  }
});

// Create persistent announcement
router.post('/announcement', requireAdmin, async (req, res) => {
  try {
    const { title, message, type = 'banner', priority = 'medium', showToNewUsers = true, expiresInHours } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let expiresAt = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
    }

    const [announcement] = await db
      .insert(announcements)
      .values({
        title,
        message,
        type,
        priority,
        showToNewUsers,
        expiresAt
      })
      .returning();

    res.json({
      message: 'Announcement created successfully',
      announcement: {
        id: announcement.id,
        title: announcement.title,
        type: announcement.type,
        priority: announcement.priority,
        createdAt: announcement.createdAt
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Failed to create announcement' 
    });
  }
});

// Get all broadcasts (admin view)
router.get('/broadcasts', requireAdmin, async (req, res) => {
  try {
    const allBroadcasts = await db
      .select()
      .from(broadcasts)
      .orderBy(broadcasts.createdAt);

    res.json(allBroadcasts);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch broadcasts' 
    });
  }
});

// Get all announcements (admin view)
router.get('/announcements', requireAdmin, async (req, res) => {
  try {
    const allAnnouncements = await db
      .select()
      .from(announcements)
      .orderBy(announcements.createdAt);

    res.json(allAnnouncements);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch announcements' 
    });
  }
});

// Deactivate broadcast
router.patch('/broadcasts/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .update(broadcasts)
      .set({ isActive: false })
      .where(eq(broadcasts.id, id));

    res.json({ message: 'Broadcast deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to deactivate broadcast' 
    });
  }
});

// Deactivate announcement
router.patch('/announcements/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .update(announcements)
      .set({ isActive: false })
      .where(eq(announcements.id, id));

    res.json({ message: 'Announcement deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to deactivate announcement' 
    });
  }
});

// Delete user by email (Admin only)
router.delete('/user/:email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    
    // First check if user exists
    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user from database
    await db.delete(users).where(eq(users.email, email));
    
    res.json({ 
      message: `User ${email} deleted successfully`,
      deletedUser: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      message: error.message || 'Failed to delete user' 
    });
  }
});

// Bulk delete users by email list (Admin only)
router.post('/users/bulk-delete', requireAdmin, async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Email list is required' });
    }

    const deletedUsers = [];
    const errors = [];

    for (const email of emails) {
      try {
        const user = await authService.getUserByEmail(email);
        if (user) {
          await db.delete(users).where(eq(users.email, email));
          deletedUsers.push({ id: user.id, email: user.email });
        } else {
          errors.push({ email, error: 'User not found' });
        }
      } catch (error: any) {
        errors.push({ email, error: error.message });
      }
    }
    
    res.json({ 
      message: `Bulk delete completed. ${deletedUsers.length} users deleted, ${errors.length} errors`,
      deletedUsers,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Error in bulk delete:", error);
    res.status(500).json({ 
      message: error.message || 'Failed to bulk delete users' 
    });
  }
});

export default router;