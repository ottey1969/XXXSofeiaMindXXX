# COMPLETE SYSTEM BACKUP - SOFEIA AI
**Backup Date:** January 27, 2025  
**Status:** ✅ FULLY WORKING SYSTEM
**Authentication:** ✅ Session persistence fixed
**Credit System:** ✅ 3 credits every 2 days working
**AI Routing:** ✅ Multi-provider system working

## Critical Working Components

### 1. Authentication System (WORKING)
- Session persistence: ✅ Users stay logged in
- Smart email remember: ✅ Pre-fills user email
- Credit renewal: ✅ Automatic 3 credits every 48 hours
- Email verification: ✅ GDPR compliant flow

### 2. AI Provider System (WORKING)
- Groq: Fast responses for simple queries
- Perplexity: Research with citations
- Anthropic: Complex content generation
- Query routing: Automatic provider selection

### 3. Database Schema (WORKING)
- Users table with credit renewal tracking
- Sessions table for PostgreSQL persistence
- Conversations and messages with metadata
- Notifications, broadcasts, announcements

### 4. Admin System (WORKING)
- Admin key: 0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb
- Credit management: Add credits to users
- User lookup: View user information
- Broadcast messaging system

## Environment Variables Required
```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=secure-random-string
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
PERPLEXITY_API_KEY=pplx-...
SENDGRID_API_KEY=SG...
NODE_ENV=development
REPLIT_DB_URL=(auto-set by Replit)
REPLIT_DOMAINS=(auto-set by Replit)
```

## Package Dependencies (Working Versions)
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "@hookform/resolvers": "latest", 
    "@neondatabase/serverless": "latest",
    "@radix-ui/react-*": "latest (all components)",
    "@sendgrid/mail": "latest",
    "@tanstack/react-query": "latest",
    "express": "latest",
    "express-session": "latest",
    "connect-pg-simple": "latest",
    "drizzle-orm": "latest",
    "drizzle-kit": "latest",
    "react": "18",
    "wouter": "latest",
    "zod": "latest"
  }
}
```

## Core Architecture Files

### Frontend Structure
```
client/
├── src/
│   ├── components/
│   │   ├── auth/AuthDialog.tsx (Smart remember working)
│   │   ├── ui/ (shadcn components)
│   │   ├── CreditRenewalNotification.tsx
│   │   ├── BroadcastMessages.tsx
│   │   └── AnnouncementBanner.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── AdminPanel.tsx
│   │   └── Chat.tsx
│   ├── hooks/
│   │   ├── useAuth.ts (Session management)
│   │   └── use-toast.ts
│   └── lib/
│       ├── queryClient.ts
│       └── utils.ts
```

### Backend Structure  
```
server/
├── routes/
│   ├── auth.ts (Session regeneration working)
│   └── admin.ts
├── middleware/
│   ├── session.ts (secure: false CRITICAL)
│   └── auth.ts
├── services/
│   ├── ai-router.ts
│   ├── groq-service.ts
│   ├── perplexity-service.ts
│   ├── anthropic-service.ts
│   └── emailService.ts
├── auth.ts (Credit renewal system)
├── storage.ts
└── db.ts
```

## Database Schema Backup
```sql
-- Users table with credit renewal
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  credits INTEGER DEFAULT 3,
  email_verified BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  ip_address VARCHAR,
  last_credit_renewal TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (PostgreSQL store)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Conversations and messages
CREATE TABLE conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  title VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR REFERENCES conversations(id),
  content TEXT NOT NULL,
  role VARCHAR NOT NULL,
  provider VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications system
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Broadcast system
CREATE TABLE broadcasts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE broadcast_reads (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  broadcast_id VARCHAR REFERENCES broadcasts(id),
  read_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info',
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Critical Configuration Files

### 1. Session Configuration (DO NOT CHANGE)
```typescript
// server/middleware/session.ts
export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'sofeia-ai-secret-key-development',
    store: sessionStore,
    resave: false,
    saveUninitialized: true, // CRITICAL: Must be true
    rolling: true,
    name: 'sofeia.sid',
    cookie: {
      httpOnly: true,
      secure: false, // CRITICAL: Must be false in development
      maxAge: sessionTtl,
      sameSite: 'lax',
      path: '/'
    },
  });
}
```

### 2. CORS Configuration
```typescript
// server/routes.ts
app.use(cors({
  origin: isReplitProduction ? [
    `https://${process.env.REPLIT_DOMAINS}`,
    `https://${process.env.REPLIT_DOMAINS?.split('.')[0]}.replit.dev`,
    'https://sofeia-ai.replit.app'
  ] : true,
  credentials: true,
  exposedHeaders: ['set-cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
```

### 3. Database Connection
```typescript
// server/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

## Working Features Checklist
- ✅ User registration with email verification
- ✅ Session-based authentication persistence  
- ✅ Smart email remember in auth dialog
- ✅ Automated credit renewal (3 credits every 2 days)
- ✅ Multi-AI provider routing (Groq/Perplexity/Anthropic)
- ✅ C.R.A.F.T framework content optimization
- ✅ Admin credit management system
- ✅ Broadcast messaging system
- ✅ Notification system
- ✅ File upload capabilities
- ✅ Conversation management
- ✅ SEO optimization with schema markup

## Recovery Instructions
1. Restore key configuration files from this backup
2. Ensure environment variables are set correctly
3. Run database migrations: `npm run db:push`
4. Test authentication with curl commands
5. Verify session cookies are being set
6. Check all AI providers are responding

## Contact Support
- WhatsApp: +31 6 2807 3996
- Facebook Group: https://www.facebook.com/groups/1079321647257618

**This backup represents a fully functional Sofeia AI system as of January 27, 2025**