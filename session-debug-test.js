// Quick session debug test
// Run this with: node session-debug-test.js

console.log('=== SESSION DEBUG TEST ===');

// Check environment variables
console.log('1. Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'SET' : 'MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

// Test database connection
const testDB = async () => {
  try {
    console.log('\n2. Database Connection Test:');
    const { Pool } = require('@neondatabase/serverless');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    
    // Check if sessions table exists
    const sessionCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'sessions'
    `);
    
    if (sessionCheck.rows.length > 0) {
      console.log('✅ Sessions table exists');
      
      // Count sessions
      const sessionCount = await pool.query('SELECT COUNT(*) FROM sessions');
      console.log(`📊 Active sessions: ${sessionCount.rows[0].count}`);
    } else {
      console.log('❌ Sessions table missing - this is the problem!');
    }
    
    await pool.end();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
};

testDB();