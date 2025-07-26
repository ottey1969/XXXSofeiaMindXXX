import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  role: varchar("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  provider: varchar("provider", { enum: ["groq", "perplexity", "anthropic"] }),
  processingSteps: json("processing_steps"), // C.R.A.F.T steps
  citations: json("citations"),
  keywordData: json("keyword_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

// AI Provider Types
export interface AIResponse {
  content: string;
  provider: string;
  metadata?: any;
  citations?: Citation[];
  processingSteps?: CraftStep[];
  keywordData?: KeywordData[];
}

export interface Citation {
  url: string;
  title: string;
  source: string;
}

export interface CraftStep {
  step: 'cut' | 'review' | 'add' | 'fact-check' | 'trust-build';
  description: string;
  applied: boolean;
}

export interface KeywordData {
  keyword: string;
  volume: string;
  difficulty: string;
  intent: string;
}

export interface QueryAnalysis {
  complexity: 'simple' | 'complex' | 'research';
  provider: 'groq' | 'perplexity' | 'anthropic';
  requiresCraft: boolean;
  requiresKeywordResearch: boolean;
  targetCountry?: string;
}
