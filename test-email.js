// Test Gmail configuration
console.log('Environment variables check:');
console.log('GMAIL_USER:', process.env.GMAIL_USER || 'NOT SET');
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');

// List all environment variables that start with GMAIL or EMAIL
console.log('\nAll Gmail/Email related env vars:');
Object.keys(process.env).filter(key => 
  key.includes('GMAIL') || key.includes('EMAIL')
).forEach(key => {
  console.log(`${key}: ${key.includes('PASSWORD') ? 'SET' : process.env[key]}`);
});