#!/bin/bash
# Authentication System Restore Script
# Use this if authentication breaks and needs to be restored to working state

echo "🔧 Restoring working authentication configuration..."

# Create backup of current files
echo "📁 Creating backup of current files..."
cp server/middleware/session.ts server/middleware/session.ts.backup.$(date +%s)
cp server/routes/auth.ts server/routes/auth.ts.backup.$(date +%s)
cp client/src/components/auth/AuthDialog.tsx client/src/components/auth/AuthDialog.tsx.backup.$(date +%s)

# Key fix 1: Force secure: false in session config
echo "🔑 Fixing session cookie configuration..."
cat > server/middleware/session.ts << 'EOF'
import session from 'express-session';
import connectPg from 'connect-pg-simple';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // CRITICAL FIX: Force development mode for session cookies
  console.log('FORCED DEV SESSION - cookies will work:', {
    env: process.env.NODE_ENV || 'development',
    hasSecret: !!process.env.SESSION_SECRET
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'sofeia-ai-secret-key-development',
    store: sessionStore,
    resave: false,
    saveUninitialized: true, // Always create session
    rolling: true, // Extend session on activity  
    name: 'sofeia.sid',
    cookie: {
      httpOnly: true,
      secure: false, // FORCE false - cookies must work in development!
      maxAge: sessionTtl,
      sameSite: 'lax',
      path: '/'
    },
  });
}
EOF

echo "✅ Session configuration restored"

# Test the fix
echo "🧪 Testing authentication..."
echo "Starting server test in 5 seconds..."
sleep 5

# Test session cookie creation
curl -v -H "Content-Type: application/json" -d '{"email":"test@example.com"}' -c test-restore.txt "http://localhost:5000/api/auth/register" 2>&1 | grep -E "(Set-Cookie|HTTP/)"

# Test session persistence
echo "🔍 Testing session persistence..."
curl -b test-restore.txt "http://localhost:5000/api/auth/me"

echo ""
echo "🎯 If you see user data above, authentication is restored!"
echo "🚨 If you see 'Not authenticated', check server logs for errors"

# Cleanup
rm -f test-restore.txt

echo "✅ Authentication restore script completed"
EOF

# Make script executable
chmod +x RESTORE_AUTHENTICATION.sh

echo "📝 Restore script created at RESTORE_AUTHENTICATION.sh"