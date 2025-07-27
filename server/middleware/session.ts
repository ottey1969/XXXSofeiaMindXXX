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