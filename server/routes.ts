import express, { type Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { aiRouter } from "./services/ai-router";
import { groqService } from "./services/groq-service";
import { perplexityService } from "./services/perplexity-service";
import { anthropicService } from "./services/anthropic-service";
import { craftFramework } from "./services/craft-framework";
import { keywordResearchService } from "./services/keyword-research";
import { getSession } from "./middleware/session";
import { requireAuth, requireCredits, type AuthenticatedRequest } from "./middleware/auth";
import { authService } from "./auth";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import { notifications, broadcasts, broadcastReads, announcements, insertBroadcastSchema, insertAnnouncementSchema, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";

const ADMIN_KEY = "0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and audio files
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, documents, and audio files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoints for deployment - use specific paths only
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      service: 'sofeia-ai-agent',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/healthcheck', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'Sofeia AI Agent is running',
      timestamp: new Date().toISOString()
    });
  });
  
  // Trust proxy for correct IP addresses (essential for Replit)
  app.set('trust proxy', 1);
  
  // CORS configuration for Replit production
  const isReplitProduction = !!process.env.REPLIT_DB_URL;
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
  
  // Add session middleware with Replit production support
  app.use(getSession());
  
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add basic security headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  }, express.static(uploadsDir));
  
  // Enhanced health check endpoints for deployment
  app.get('/api/health', async (req, res) => {
    try {
      // Check database connection
      const dbCheck = await db.select().from(users).limit(1);
      
      res.status(200).json({ 
        status: 'healthy', 
        service: 'sofeia-ai-agent',
        message: 'Sofeia AI Agent is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'connected',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '2.0.0'
      });
    } catch (error: any) {
      res.status(503).json({
        status: 'unhealthy',
        service: 'sofeia-ai-agent', 
        message: 'Database connection failed',
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Authentication routes
  app.use('/api/auth', authRoutes);
  
  // Auth health check endpoint
  app.get('/api/auth/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      session: !!req.session,
      cookies: req.headers.cookie ? 'present' : 'missing',
      secure: req.secure,
      host: req.get('host'),
      sessionId: req.sessionID ? 'SET' : 'NOT_SET',
      hasUser: !!(req.session as any)?.userId,
      environment: {
        isReplit: !!process.env.REPLIT_DB_URL,
        domain: process.env.REPLIT_DOMAINS,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    });
  });

  // Debug login test endpoint
  app.post('/api/debug/test-login', (req, res) => {
    // Force set session data
    (req.session as any).userId = 'test-user-123';
    (req.session as any).debug = true;
    
    req.session.save((err) => {
      res.setHeader('Content-Type', 'application/json');
      res.json({
        sessionId: req.sessionID,
        sessionSaved: !err,
        error: err?.message,
        cookieSettings: {
          secure: (req.session as any).cookie?.secure,
          httpOnly: (req.session as any).cookie?.httpOnly,
          sameSite: (req.session as any).cookie?.sameSite,
          domain: (req.session as any).cookie?.domain
        },
        isSecureConnection: req.secure,
        protocol: req.protocol
      });
    });
  });

  // Debug endpoint for session verification (must be before static routing)
  app.get('/api/debug/session', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      sessionId: req.sessionID ? 'SET' : 'NOT_SET',
      hasSession: !!(req.session as any)?.userId,
      environment: {
        isReplit: !!process.env.REPLIT_DB_URL,
        domain: process.env.REPLIT_DOMAINS,
        nodeEnv: process.env.NODE_ENV || 'undefined'
      },
      cookieConfig: {
        secure: !!(req.session as any)?.cookie?.secure,
        httpOnly: !!(req.session as any)?.cookie?.httpOnly,
        sameSite: (req.session as any)?.cookie?.sameSite,
        domain: (req.session as any)?.cookie?.domain
      }
    });
  });
  
  // Direct logout route for users who are stuck
  app.get('/api/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
  
  // Admin routes
  app.use('/api/admin', adminRoutes);

  // Contact admin endpoint (for users to send messages to admin)
  app.post('/api/admin/contact', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { subject, message } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required' });
      }

      const userId = req.user!.id;
      const userEmail = req.user!.email;

      // Store the admin message 
      await storage.createAdminMessage({
        userEmail,
        userId,
        subject: subject.trim(),
        message: message.trim(),
        userCredits: req.user!.credits || 0,
      });

      res.json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error("Error sending admin message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get user notifications (protected)
  app.get('/api/notifications', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(notifications.createdAt);

      // Filter out expired notifications
      const activeNotifications = userNotifications.filter((n: any) => 
        !n.expiresAt || new Date(n.expiresAt) > new Date()
      );

      res.json(activeNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read (protected)
  app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Get broadcasts for user (shows unread and recent)
  app.get('/api/broadcasts', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get active broadcasts
      const activeBroadcasts = await db
        .select()
        .from(broadcasts)
        .where(sql`is_active = true AND (expires_at IS NULL OR expires_at > now())`)
        .orderBy(broadcasts.createdAt);

      // Get read status for this user
      const readBroadcasts = await db
        .select()
        .from(broadcastReads)
        .where(eq(broadcastReads.userId, userId));

      const readIds = new Set(readBroadcasts.map(br => br.broadcastId));

      // Mark broadcasts as read/unread
      const broadcastsWithStatus = activeBroadcasts.map(broadcast => ({
        ...broadcast,
        isRead: readIds.has(broadcast.id)
      }));

      res.json(broadcastsWithStatus);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      res.status(500).json({ message: "Failed to fetch broadcasts" });
    }
  });

  // Mark broadcast as read
  app.post('/api/broadcasts/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if already marked as read
      const [existing] = await db
        .select()
        .from(broadcastReads)
        .where(sql`broadcast_id = ${id} AND user_id = ${userId}`);

      if (!existing) {
        await db.insert(broadcastReads).values({
          broadcastId: id,
          userId
        });
      }

      res.json({ message: 'Broadcast marked as read' });
    } catch (error) {
      console.error("Error marking broadcast as read:", error);
      res.status(500).json({ message: "Failed to mark broadcast as read" });
    }
  });

  // Get active announcements
  app.get('/api/announcements', async (req, res) => {
    try {
      const activeAnnouncements = await db
        .select()
        .from(announcements)
        .where(sql`is_active = true AND (expires_at IS NULL OR expires_at > now())`)
        .orderBy(announcements.priority, announcements.createdAt);

      res.json(activeAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });
  
  // Get conversations for user (protected)
  app.get("/api/conversations", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create new conversation (protected)
  app.post("/api/conversations", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Delete conversation (protected)
  app.delete("/api/conversations/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      // Verify the conversation belongs to the user
      const conversation = await storage.getConversation(id);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const deleted = await storage.deleteConversation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Get messages for a conversation (protected)
  app.get("/api/conversations/:id/messages", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByConversation(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response (protected, requires credits)
  app.post("/api/conversations/:id/messages", requireAuth, requireCredits, async (req: AuthenticatedRequest, res) => {
    try {
      const { id: conversationId } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Use a credit before processing
      const creditResult = await authService.useCredit(req.user!.id);
      if (!creditResult.success) {
        return res.status(402).json({ 
          message: 'No credits remaining',
          action: 'buy_credits',
          whatsappUrl: 'https://wa.me/31628073996?text=Hi%2C%20I%20need%20more%20credits%20for%20Sofeia%20AI'
        });
      }

      // Store user message
      const userMessage = await storage.createMessage({
        conversationId,
        role: 'user',
        content,
        metadata: null,
        provider: null,
        processingSteps: null,
        citations: null,
        keywordData: null
      });

      // Analyze query and determine AI provider
      const analysis = aiRouter.analyzeQuery(content);
      console.log(`AI Routing Analysis: Provider=${analysis.provider}, Complexity=${analysis.complexity}, Query="${content}"`);
      
      let aiResponse;
      let retryWithFallback = false;

      try {
        // Route to appropriate AI service
        switch (analysis.provider) {
          case 'groq':
            aiResponse = await groqService.generateResponse(content);
            break;
          case 'perplexity':
            aiResponse = await perplexityService.researchQuery(content, analysis.targetCountry);
            break;
          case 'anthropic':
            aiResponse = await anthropicService.generateResponse(content);
            break;
          default:
            throw new Error(`Unknown provider: ${analysis.provider}`);
        }
      } catch (error) {
        console.error(`${analysis.provider} service error:`, error);
        
        // Check if we should fallback to Anthropic
        if (aiRouter.shouldFallbackToAnthropic(analysis.provider, error)) {
          console.log('Falling back to Anthropic...');
          aiResponse = await anthropicService.generateResponse(content);
          retryWithFallback = true;
        } else {
          throw error;
        }
      }

      // Apply C.R.A.F.T framework if needed
      let finalContent = aiResponse.content;
      let craftSteps = undefined;
      
      if (analysis.requiresCraft) {
        const craftResult = await craftFramework.applyCraftFramework(
          aiResponse.content, 
          analysis.targetCountry
        );
        finalContent = craftResult.optimizedContent;
        craftSteps = craftResult.steps;
      }

      // Get keyword research if needed (only for research queries, not blog posts)
      let keywordData = undefined;
      if (analysis.requiresKeywordResearch) {
        keywordData = await keywordResearchService.researchKeywords(
          content, 
          analysis.targetCountry
        );
      }

      // Store AI response
      const assistantMessage = await storage.createMessage({
        conversationId,
        role: 'assistant',
        content: finalContent,
        provider: retryWithFallback ? 'anthropic' : analysis.provider,
        metadata: {
          ...aiResponse.metadata,
          analysis,
          fallback: retryWithFallback
        },
        processingSteps: craftSteps,
        citations: aiResponse.citations || null,
        keywordData: keywordData || null
      });

      // Update conversation title if it's the first message
      const conversation = await storage.getConversation(conversationId);
      if (conversation && !conversation.title) {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        await storage.updateConversation(conversationId, { title });
      }

      res.json({
        userMessage,
        assistantMessage,
        analysis
      });

    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ 
        message: "Failed to process message",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get keyword research for a topic
  app.post("/api/keywords/research", async (req, res) => {
    try {
      const { topic, targetCountry = 'usa' } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const keywords = await keywordResearchService.researchKeywords(topic, targetCountry);
      res.json({ keywords, targetCountry });
    } catch (error) {
      console.error("Error researching keywords:", error);
      res.status(500).json({ message: "Failed to research keywords" });
    }
  });

  // Apply C.R.A.F.T framework to content
  app.post("/api/content/craft", async (req, res) => {
    try {
      const { content, targetCountry = 'usa' } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const result = await craftFramework.applyCraftFramework(content, targetCountry);
      res.json(result);
    } catch (error) {
      console.error("Error applying C.R.A.F.T framework:", error);
      res.status(500).json({ message: "Failed to apply C.R.A.F.T framework" });
    }
  });

  // IP Security Management (Admin)
  app.post("/api/admin/ip-security", async (req, res) => {
    const { adminKey, ipAddress, ruleType, reason } = req.body;
    
    if (adminKey !== "0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const rule = await storage.createIpSecurityRule({
        ipAddress,
        ruleType,
        reason,
        createdBy: "admin"
      });
      
      res.json({ 
        message: `IP ${ipAddress} ${ruleType}ed successfully`,
        rule 
      });
    } catch (error) {
      console.error("Error managing IP:", error);
      res.status(500).json({ message: "Failed to manage IP" });
    }
  });

  // Block User (Admin)
  app.post("/api/admin/block-user", async (req, res) => {
    const { adminKey, userEmail, reason } = req.body;
    
    if (adminKey !== "0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const blockRecord = await storage.blockUser({
        userId: user.id,
        reason,
        blockedBy: "admin"
      });
      
      res.json({ 
        message: `User ${userEmail} blocked successfully`,
        blockRecord 
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  // Force User Logout (Admin)
  app.post("/api/admin/force-logout", async (req, res) => {
    const { adminKey, userEmail } = req.body;
    
    if (adminKey !== "0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.logUserActivity({
        userId: user.id,
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "",
        action: "forced_logout",
        details: { reason: "Admin forced logout" }
      });
      
      res.json({ 
        message: `User ${userEmail} logout forced successfully`
      });
    } catch (error) {
      console.error("Error forcing logout:", error);
      res.status(500).json({ message: "Failed to force logout" });
    }
  });

  // Get Activity Log (Admin)
  app.get("/api/admin/activity-log", async (req, res) => {
    const { adminKey } = req.query;
    
    if (adminKey !== "0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ message: "Failed to fetch activity log" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Determine file type
      let fileType: string;
      if (req.file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (req.file.mimetype.startsWith('audio/')) {
        fileType = 'audio';
      } else if (req.file.mimetype === 'application/pdf' || 
                 req.file.mimetype.includes('document') || 
                 req.file.mimetype === 'text/plain') {
        fileType = 'document';
      } else {
        fileType = 'document'; // Default fallback
      }

      // Save upload info to storage
      const uploadRecord = await storage.createUploadFile({
        userId: req.user!.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        fileType,
        filePath: `/uploads/${req.file.filename}`
      });

      res.json({
        id: uploadRecord.id,
        filename: uploadRecord.filename,
        originalName: uploadRecord.originalName,
        fileType: uploadRecord.fileType,
        size: uploadRecord.size,
        url: uploadRecord.filePath
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Clean up file if upload record failed
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }
      
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Get user's uploaded files
  app.get("/api/uploads", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const uploads = await storage.getUserUploadFiles(req.user!.id);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching uploads:", error);
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });

  // Delete uploaded file
  app.delete("/api/uploads/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const upload = await storage.getUploadFile(id);
      
      if (!upload || upload.userId !== req.user!.id) {
        return res.status(404).json({ message: "File not found" });
      }

      // Delete physical file
      const filePath = path.join(uploadsDir, upload.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from storage
      await storage.deleteUploadFile(id);
      
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Admin Messages Routes
  app.get('/api/admin/messages', async (req, res) => {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const messages = await storage.getAdminMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching admin messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.patch('/api/admin/messages/:messageId/read', async (req, res) => {
    const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
    
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const { messageId } = req.params;
      await storage.markAdminMessageAsRead(messageId);
      res.json({ message: 'Message marked as read' });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ message: 'Failed to mark message as read' });
    }
  });

  app.delete('/api/admin/messages/:messageId', async (req, res) => {
    const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
    
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const { messageId } = req.params;
      await storage.deleteAdminMessage(messageId);
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Failed to delete message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
