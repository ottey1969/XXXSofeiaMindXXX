import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Prevent server from going to sleep with keep-alive
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  next();
});

// Self-ping mechanism to prevent sleep (production only)
if (process.env.NODE_ENV === 'production') {
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
  const SITE_URL = process.env.REPL_URL || 'https://contentscale.site';
  
  setInterval(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${SITE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      log(`Keep-alive ping: ${response.status}`);
    } catch (error: any) {
      log(`Keep-alive ping failed: ${error?.message || 'Unknown error'}`);
    }
  }, PING_INTERVAL);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Production process management
  if (process.env.NODE_ENV === 'production') {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      log(`Uncaught Exception: ${error.message}`);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      log('Received SIGINT. Graceful shutdown...');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      log('Received SIGTERM. Graceful shutdown...');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    if (process.env.NODE_ENV === 'production') {
      log('Production server started with keep-alive enabled');
    }
  });
})();

