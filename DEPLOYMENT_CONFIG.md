# Deployment Configuration - Prevent Server Sleep

## Problem Solved
✅ **Fixed:** Server going to sleep and showing "Not Found" errors
✅ **Added:** Keep-alive mechanisms to prevent deployment downtime
✅ **Enhanced:** Health check endpoints with database monitoring
✅ **Implemented:** Self-ping system for production servers

## Keep-Alive Features Implemented

### 1. HTTP Keep-Alive Headers
- Connection: keep-alive
- Keep-Alive: timeout=5, max=1000
- Applied to all server responses

### 2. Self-Ping Mechanism (Production Only)
- Pings server every 14 minutes to prevent sleep
- Uses AbortController for timeout handling
- Targets: `/health` endpoint
- Logs ping status for monitoring

### 3. Enhanced Health Check Endpoints
- `/health` - Basic health status
- `/healthcheck` - Alternative health check
- `/api/health` - Comprehensive monitoring with:
  - Database connection verification
  - Memory usage reporting
  - Uptime tracking
  - Environment status
  - Version information

### 4. Production Process Management
- Graceful shutdown handling (SIGINT, SIGTERM)
- Uncaught exception monitoring
- Unhandled promise rejection tracking
- Process restart logging

## Deployment Commands

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Production with Memory Optimization
```bash
npm run start:prod
```

## Health Check URLs
- **Main Health:** `https://contentscale.site/health`
- **API Health:** `https://contentscale.site/api/health`
- **Alternative:** `https://contentscale.site/healthcheck`

## Environment Variables Required
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
ADMIN_KEY=0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb
REPL_URL=https://contentscale.site
```

## Monitoring Features
- Server uptime tracking
- Memory usage monitoring
- Database connection health
- Error logging and handling
- Self-monitoring ping system

## Production Optimizations
- Memory limit: 512MB max old space
- Automatic restart on crashes
- Connection pooling with keep-alive
- Error recovery mechanisms
- Graceful shutdown procedures

## Expected Behavior After Deployment
1. Server stays alive indefinitely
2. Automatic self-pings every 14 minutes
3. Health checks return detailed status
4. No more "Not Found" errors
5. Consistent availability at contentscale.site/admin

## Troubleshooting
If server still goes offline:
1. Check `/api/health` endpoint for database issues
2. Verify environment variables are set
3. Monitor server logs for errors
4. Ensure deployment platform supports keep-alive
5. Contact deployment provider if issues persist

---
**Status:** Ready for deployment with anti-sleep mechanisms