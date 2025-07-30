import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Rate limiting for registration
export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registration attempts per windowMs
  message: {
    error: 'Too many registration attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Skip failed requests that are not 429
  skipFailedRequests: false,
});

// Rate limiting for login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Honeypot middleware to detect bots
export const honeypotCheck = (req: Request, res: Response, next: NextFunction) => {
  // Check if the honeypot field is filled (indicates bot)
  if (req.body.website || req.body.url || req.body.honeypot) {
    console.log('🍯 Honeypot triggered - potential bot detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      honeypotFields: {
        website: req.body.website,
        url: req.body.url,
        honeypot: req.body.honeypot
      }
    });
    
    // Return a fake success response to not reveal the honeypot
    return res.status(200).json({
      message: 'Registration successful! Please check your email for verification.'
    });
  }
  
  next();
};

// Simple CAPTCHA verification middleware (placeholder for hCaptcha)
export const captchaVerify = async (req: Request, res: Response, next: NextFunction) => {
  const { captchaToken } = req.body;
  
  // Skip CAPTCHA in development or if no secret is configured
  if (process.env.NODE_ENV === 'development' || !process.env.HCAPTCHA_SECRET || process.env.HCAPTCHA_SECRET === 'dummy_hcaptcha_secret') {
    console.log('⚠️ CAPTCHA verification skipped (development mode or no secret configured)');
    return next();
  }
  
  if (!captchaToken) {
    return res.status(400).json({
      error: 'CAPTCHA verification required'
    });
  }
  
  try {
    // Verify hCaptcha token
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET!,
        response: captchaToken,
        remoteip: req.ip || ''
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.log('❌ CAPTCHA verification failed:', result);
      return res.status(400).json({
        error: 'CAPTCHA verification failed. Please try again.'
      });
    }
    
    console.log('✅ CAPTCHA verification successful');
    next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return res.status(500).json({
      error: 'CAPTCHA verification service unavailable. Please try again later.'
    });
  }
};

// Email validation middleware
export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      error: 'Email is required'
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address'
    });
  }
  
  // Check for suspicious email patterns
  const suspiciousPatterns = [
    /^[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}$/i, // Too simple pattern
    /^\d+@/, // Starts with numbers
    /temp|fake|test|spam|trash|disposable/i, // Suspicious keywords
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(email));
  if (isSuspicious) {
    console.log('🚨 Suspicious email detected:', email);
    // Don't block immediately, but log for monitoring
  }
  
  next();
};

