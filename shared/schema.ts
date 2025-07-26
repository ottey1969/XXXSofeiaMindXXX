import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with email auth and credits
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  credits: integer("credits").default(3).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  marketingConsent: boolean("marketing_consent").default(false).notNull(),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastCreditRenewal: timestamp("last_credit_renewal").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  userId: varchar("user_id").references(() => users.id),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Admin notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ["info", "warning", "success", "error"] }).default("info"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export const adminMessages = pgTable("admin_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userEmail: varchar("user_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status", { enum: ["unread", "read", "replied"] }).default("unread").notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow(),
  repliedAt: timestamp("replied_at"),
});

export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({
  id: true,
  createdAt: true,
  repliedAt: true,
});

// Broadcast messages table - sent to all users
export const broadcasts = pgTable("broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ["info", "warning", "success", "error", "announcement"] }).default("info"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Broadcast read status - tracks which users have read each broadcast
export const broadcastReads = pgTable("broadcast_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  broadcastId: varchar("broadcast_id").references(() => broadcasts.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  readAt: timestamp("read_at").defaultNow(),
});

// Persistent announcements table - always visible banners
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ["info", "warning", "success", "error", "banner"] }).default("banner"),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
  isActive: boolean("is_active").default(true),
  showToNewUsers: boolean("show_to_new_users").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertBroadcastSchema = createInsertSchema(broadcasts).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export type Broadcast = typeof broadcasts.$inferSelect;
export type BroadcastRead = typeof broadcastReads.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
// IP Security Management
export const ipSecurityRules = pgTable("ip_security_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: varchar("ip_address").notNull(),
  ruleType: varchar("rule_type", { enum: ["allow", "block"] }).notNull(),
  reason: text("reason"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// User Activity and Security Log
export const userActivityLog = pgTable("user_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  action: varchar("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocked Users
export const blockedUsers = pgTable("blocked_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  reason: text("reason"),
  blockedBy: varchar("blocked_by").notNull(),
  blockedAt: timestamp("blocked_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;
export type IpSecurityRule = typeof ipSecurityRules.$inferSelect;
export type InsertIpSecurityRule = typeof ipSecurityRules.$inferInsert;
export type UserActivityLog = typeof userActivityLog.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLog.$inferInsert;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type InsertBlockedUser = typeof blockedUsers.$inferInsert;

// File uploads table
export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  fileType: varchar("file_type", { enum: ["image", "document", "audio", "video"] }).notNull(),
  filePath: varchar("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

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
