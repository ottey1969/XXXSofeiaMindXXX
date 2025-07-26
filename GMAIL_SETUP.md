# Gmail Email Setup for Sofeia AI

## Quick Setup Instructions

### 1. Create Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Under "2-Step Verification" make sure it's enabled
4. Scroll down to "App passwords"
5. Click "App passwords"
6. Select "Mail" and your device
7. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### 2. Set Environment Variables

Add these to your Replit Secrets:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**Example:**
- `GMAIL_USER`: `support@contentscale.com`
- `GMAIL_APP_PASSWORD`: `abcd efgh ijkl mnop`
- `EMAIL_FROM`: `noreply@sofeia.ai`

### 3. Alternative: Custom SMTP

If you have a hosting provider (like Hostinger, cPanel, etc.):

```
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
SMTP_SECURE=false
EMAIL_FROM=noreply@yourdomain.com
```

## Production Deployment

1. Set environment variables in your production environment
2. The email service will automatically detect and use the configured method
3. Users will receive professional verification emails
4. No more manual verification needed

## Testing

Once configured, users will:
1. Enter their email
2. Receive a professional verification email
3. Click the link or enter the code
4. Get immediate access to their 3 credits

## Troubleshooting

- **Gmail not working?** Make sure 2-Step Verification is enabled first
- **SMTP issues?** Check with your hosting provider for correct settings
- **Still having problems?** Contact WhatsApp +31 6 2807 3996 for support

The system automatically falls back to manual verification if email isn't configured.