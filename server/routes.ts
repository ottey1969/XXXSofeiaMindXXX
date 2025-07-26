import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { aiRouter } from "./services/ai-router";
import { groqService } from "./services/groq-service";
import { perplexityService } from "./services/perplexity-service";
import { anthropicService } from "./services/anthropic-service";
import { craftFramework } from "./services/craft-framework";
import { keywordResearchService } from "./services/keyword-research";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.listConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByConversation(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id: conversationId } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
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

      // Get keyword research if needed
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

  const httpServer = createServer(app);
  return httpServer;
}
