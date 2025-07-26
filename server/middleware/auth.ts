import { Request, Response, NextFunction } from 'express';
import { authService } from '../auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    credits: number;
    emailVerified: boolean;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ 
      message: 'Authentication required',
      action: 'login'
    });
  }

  try {
    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        action: 'login'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      credits: user.credits,
      emailVerified: user.emailVerified
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const requireCredits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.credits <= 0) {
    return res.status(402).json({ 
      message: 'No credits remaining',
      action: 'buy_credits',
      whatsappUrl: 'https://wa.me/31628073996?text=Hi%2C%20I%20need%20more%20credits%20for%20Sofeia%20AI'
    });
  }

  next();
};