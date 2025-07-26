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
  
  // Detect Replit production environment
  const isReplitProduction = !!process.env.REPLIT_DB_URL;
  const isNodeProduction = process.env.NODE_ENV === 'production';
  
  return session({
    secret: process.env.SESSION_SECRET || 'sofeia-ai-secret-key-development',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Trust reverse proxy (essential for Replit)
    cookie: {
      httpOnly: true,
      secure: isReplitProduction || isNodeProduction,
      maxAge: sessionTtl,
      // Replit-specific production settings
      ...(isReplitProduction ? {
        sameSite: 'none', // Required for cross-origin on Replit
        domain: '.replit.dev' // Correct Replit domain
      } : {
        sameSite: 'lax' // Development setting
      })
    },
  });
}