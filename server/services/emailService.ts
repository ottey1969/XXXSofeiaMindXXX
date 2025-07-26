import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Try multiple email service configurations
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Custom SMTP (most flexible)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Gmail with App Password (free option)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      // Mailgun (alternative to SendGrid)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        auth: {
          user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
          pass: process.env.MAILGUN_API_KEY,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('No email transporter configured. Email would be sent in production.');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'NoReply@ContentScale.site',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
    const verificationUrl = `${baseUrl}/verify?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Sofeia AI Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #06B6D4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 Sofeia AI</h1>
            <p>Welcome to the world's most advanced AI content generator</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up for Sofeia AI! You're just one step away from accessing your 3 free credits and creating amazing SEO-optimized content.</p>
            
            <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e5e5; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <h3>🚀 What's Next?</h3>
            <ul>
              <li><strong>3 Free Credits:</strong> Start creating content immediately</li>
              <li><strong>C.R.A.F.T Framework:</strong> Get SEO-optimized content that outranks competitors</li>
              <li><strong>Multi-AI Routing:</strong> Best responses from Groq, Perplexity, and Anthropic</li>
              <li><strong>Ready-to-Use HTML:</strong> Copy and paste directly to your website</li>
            </ul>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>💡 Pro Tip:</strong> Target high-volume, low-competition keywords like "AI SEO content generator" to outrank BrandWell and Content at Scale!
            </div>
          </div>
          <div class="footer">
            <p>Need help? Contact us on WhatsApp: <a href="https://wa.me/31628073996">+31 6 2807 3996</a></p>
            <p>Join our community: <a href="https://www.facebook.com/groups/1079321647257618">ContentScale Facebook Group</a></p>
            <p>&copy; 2025 Sofeia AI by ContentScale. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verify Your Sofeia AI Account

      Thank you for signing up! Click the link below to verify your email and access your 3 free credits:
      
      ${verificationUrl}
      
      What's included:
      - 3 Free Credits to start creating content
      - C.R.A.F.T Framework for SEO optimization  
      - Multi-AI routing for best responses
      - Ready-to-use HTML content
      
      Need help? Contact us on WhatsApp: +31 6 2807 3996
      Join our community: https://www.facebook.com/groups/1079321647257618
      
      © 2025 Sofeia AI by ContentScale
    `;

    return this.sendEmail({
      to: email,
      subject: '🤖 Verify Your Sofeia AI Account - 3 Free Credits Waiting!',
      html,
      text,
    });
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }
}

export const emailService = new EmailService();