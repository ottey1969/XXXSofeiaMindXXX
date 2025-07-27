import { Router } from 'express';
import { authService } from '../auth';
import { emailService } from '../services/emailService';
import { z } from 'zod';

const router = Router();

// Login with email (for existing users)
router.post('/login', async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email('Invalid email address')
    }).parse(req.body);

    // Check if user exists
    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please register first.' });
    }

    // Check for credit renewal on login
    const renewalResult = await authService.checkAndRenewCredits(user.id);

    // Set session to log user in and regenerate session ID for security
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).json({ message: 'Login failed - session error' });
      }
      
      (req.session as any).userId = user.id;
      
      // Save session before responding to ensure Set-Cookie header is sent
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Login failed - session save error' });
        }
        
        console.log('Session saved successfully, ID:', req.sessionID);
        
        let renewalMessage = '';
        if (renewalResult.renewed && renewalResult.bonusRenewed) {
          renewalMessage = ' You received 3 new credits + 5 bonus credits reset for 14-day cycle!';
        } else if (renewalResult.renewed) {
          renewalMessage = ' You received 3 new credits!';
        } else if (renewalResult.bonusRenewed) {
          renewalMessage = ' Your 5 bonus credits reset for a new 14-day cycle!';
        }
        
        res.json({
          message: `Welcome back! You have ${renewalResult.newCredits} credits + ${renewalResult.newBonusCredits} bonus credits.${renewalMessage}`,
          user: {
            id: user.id,
            email: user.email,
            credits: renewalResult.newCredits,
            bonusCredits: renewalResult.newBonusCredits,
            emailVerified: user.emailVerified
          },
          creditRenewal: {
            renewed: renewalResult.renewed,
            bonusRenewed: renewalResult.bonusRenewed,
            message: renewalMessage.trim() || null
          }
        });
      });
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Login failed' 
    });
  }
});

// Register/login with email
router.post('/register', async (req, res) => {
  try {
    const { email, marketingConsent } = z.object({
      email: z.string().email('Invalid email address'),
      marketingConsent: z.boolean().default(false)
    }).parse(req.body);

    // Check if user already exists
    const existingUser = await authService.getUserByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified) {
        // Check for credit renewal
        const renewalResult = await authService.checkAndRenewCredits(existingUser.id);
        
        // User is already verified, log them in directly
        (req.session as any).userId = existingUser.id;
        
        return req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ message: 'Login failed - session error' });
          }
          
          let renewalMessage = '';
          if (renewalResult.renewed && renewalResult.bonusRenewed) {
            renewalMessage = ' You received 3 new credits + 5 bonus credits reset for 14-day cycle!';
          } else if (renewalResult.renewed) {
            renewalMessage = ' You received 3 new credits!';
          } else if (renewalResult.bonusRenewed) {
            renewalMessage = ' Your 5 bonus credits reset for a new 14-day cycle!';
          }
          
          res.json({
            message: `Email already registered and verified.${renewalMessage}`,
            userId: existingUser.id,
            email: existingUser.email,
            emailVerified: true,
            credits: renewalResult.newCredits,
            bonusCredits: renewalResult.newBonusCredits,
            autoLogin: true,
            creditRenewal: {
              renewed: renewalResult.renewed,
              bonusRenewed: renewalResult.bonusRenewed,
              message: renewalMessage.trim() || null
            }
          });
        });
      }
      
      // Check for credit renewal
      const renewalResult = await authService.checkAndRenewCredits(existingUser.id);
      
      // CRITICAL FIX: Force session creation and save
      req.session.regenerate((regErr) => {
        if (regErr) {
          console.error('Session regenerate error:', regErr);
        }
        
        (req.session as any).userId = existingUser.id;
        console.log('Setting userId in session:', existingUser.id, 'SessionID:', req.sessionID);
        
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ message: 'Registration failed - session error' });
          }
          
          console.log('Session saved successfully for user:', existingUser.id);
          let renewalMessage = '';
          if (renewalResult.renewed && renewalResult.bonusRenewed) {
            renewalMessage = ' You received 3 new credits + 5 bonus credits reset for 14-day cycle!';
          } else if (renewalResult.renewed) {
            renewalMessage = ' You received 3 new credits!';
          } else if (renewalResult.bonusRenewed) {
            renewalMessage = ' Your 5 bonus credits reset for a new 14-day cycle!';
          }
          
          res.json({
            message: `Welcome back! You have ${renewalResult.newCredits} credits + ${renewalResult.newBonusCredits} bonus credits.${renewalMessage}`,
            userId: existingUser.id,
            email: existingUser.email,
            credits: renewalResult.newCredits,
            bonusCredits: renewalResult.newBonusCredits,
            autoLogin: true,
            sessionId: req.sessionID, // Debug info
            creditRenewal: {
              renewed: renewalResult.renewed,
              bonusRenewed: renewalResult.bonusRenewed,
              message: renewalMessage.trim() || null
            }
          });
        });
      });
    }

    // Get client IP address
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
    
    const user = await authService.registerUser(email, clientIP, marketingConsent);
    
    // Send welcome notification to new user
    await authService.sendWelcomeNotification(user.id);
    
    // Set session to log user in immediately
    (req.session as any).userId = user.id;
    
    // Save session before responding to ensure Set-Cookie header is sent
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Registration failed - session error' });
      }
      
      res.json({
        message: 'Registration complete! You can start creating content with your 3 free credits.',
        userId: user.id,
        email: user.email,
        autoLogin: true
      });
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

// Get current user with credit renewal check
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

    // Check for credit renewal
    const renewalResult = await authService.checkAndRenewCredits(user.id);
    const nextRenewal = await authService.getNextRenewalDate(user.id);

    let renewalMessage = '';
    if (renewalResult.renewed && renewalResult.bonusRenewed) {
      renewalMessage = 'You received 3 new credits + 5 bonus credits reset for 14-day cycle!';
    } else if (renewalResult.renewed) {
      renewalMessage = 'You received 3 new credits!';
    } else if (renewalResult.bonusRenewed) {
      renewalMessage = 'Your 5 bonus credits reset for a new 14-day cycle!';
    }

    res.json({
      id: user.id,
      email: user.email,
      credits: renewalResult.newCredits,
      bonusCredits: renewalResult.newBonusCredits,
      emailVerified: user.emailVerified,
      creditRenewal: {
        renewed: renewalResult.renewed,
        bonusRenewed: renewalResult.bonusRenewed,
        nextRenewalDate: nextRenewal,
        message: renewalMessage || null
      }
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