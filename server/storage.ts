import { type Conversation, type Message, type InsertConversation, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  listConversations(): Promise<Conversation[]>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = { 
      id,
      title: insertConversation.title || null,
      userId: insertConversation.userId || null,
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async listConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
    );
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const userConversations = Array.from(this.conversations.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return userConversations;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const exists = this.conversations.has(id);
    if (exists) {
      this.conversations.delete(id);
      // Also delete all messages in this conversation
      const messagesToDelete = Array.from(this.messages.keys()).filter(
        messageId => this.messages.get(messageId)?.conversationId === id
      );
      messagesToDelete.forEach(messageId => this.messages.delete(messageId));
    }
    return exists;
  }

  // Security Management Methods
  private ipRules = new Map<string, any>();
  private blockedUsers = new Map<string, any>();
  private activityLog: any[] = [];

  async createIpSecurityRule(rule: any): Promise<any> {
    const id = `rule_${Date.now()}`;
    const newRule = {
      id,
      ...rule,
      createdAt: new Date(),
      isActive: true
    };
    this.ipRules.set(id, newRule);
    
    // Log the activity
    this.activityLog.unshift({
      id: `activity_${Date.now()}`,
      action: `ip_${rule.ruleType}`,
      ipAddress: rule.ipAddress,
      details: rule.reason,
      createdAt: new Date()
    });
    
    return newRule;
  }

  async blockUser(blockData: any): Promise<any> {
    const id = `block_${Date.now()}`;
    const blockRecord = {
      id,
      ...blockData,
      blockedAt: new Date(),
      isActive: true
    };
    this.blockedUsers.set(id, blockRecord);
    
    // Log the activity
    this.activityLog.unshift({
      id: `activity_${Date.now()}`,
      action: "user_blocked",
      userId: blockData.userId,
      details: blockData.reason,
      createdAt: new Date()
    });
    
    return blockRecord;
  }

  async logUserActivity(activity: any): Promise<void> {
    this.activityLog.unshift({
      id: `activity_${Date.now()}`,
      ...activity,
      createdAt: new Date()
    });
    
    // Keep only last 100 activities
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(0, 100);
    }
  }

  async getRecentActivity(): Promise<any[]> {
    return this.activityLog.slice(0, 20); // Return last 20 activities
  }

  async isIpBlocked(ipAddress: string): Promise<boolean> {
    return Array.from(this.ipRules.values()).some(
      rule => rule.ipAddress === ipAddress && rule.ruleType === "block" && rule.isActive
    );
  }

  async isUserBlocked(userId: string): Promise<boolean> {
    return Array.from(this.blockedUsers.values()).some(
      block => block.userId === userId && block.isActive
    );
  }

  // File upload management
  private uploads = new Map<string, any>();

  async createUpload(uploadData: any): Promise<any> {
    const id = `upload_${Date.now()}`;
    const upload = {
      id,
      ...uploadData,
      uploadedAt: new Date()
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUpload(id: string): Promise<any | undefined> {
    return this.uploads.get(id);
  }

  async getUserUploads(userId: string): Promise<any[]> {
    return Array.from(this.uploads.values())
      .filter(upload => upload.userId === userId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async deleteUpload(id: string): Promise<boolean> {
    return this.uploads.delete(id);
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      id,
      conversationId: insertMessage.conversationId || null,
      role: insertMessage.role,
      content: insertMessage.content,
      metadata: insertMessage.metadata || null,
      provider: insertMessage.provider || null,
      processingSteps: insertMessage.processingSteps || null,
      citations: insertMessage.citations || null,
      keywordData: insertMessage.keywordData || null,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updated = { ...message, ...updates };
    this.messages.set(id, updated);
    return updated;
  }

  // Upload file management
  private uploads: Map<string, UploadedFile> = new Map();

  async createUpload(uploadData: any): Promise<UploadedFile> {
    const id = `upload_${Date.now()}`;
    const upload = {
      id,
      ...uploadData,
      createdAt: new Date(),
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUserUploads(userId: string): Promise<UploadedFile[]> {
    return Array.from(this.uploads.values())
      .filter(upload => upload.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUpload(id: string): Promise<UploadedFile | undefined> {
    return this.uploads.get(id);
  }

  async deleteUpload(id: string): Promise<boolean> {
    return this.uploads.delete(id);
  }

  // Admin Messages Methods
  private adminMessages: Map<string, any> = new Map();

  async createAdminMessage(messageData: any): Promise<any> {
    const id = `msg_${Date.now()}`;
    const message = {
      id,
      ...messageData,
      isRead: false,
      createdAt: new Date(),
    };
    this.adminMessages.set(id, message);
    return message;
  }

  async getAdminMessages(): Promise<any[]> {
    return Array.from(this.adminMessages.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAdminMessageAsRead(messageId: string): Promise<void> {
    const message = this.adminMessages.get(messageId);
    if (message) {
      message.isRead = true;
      message.readAt = new Date();
      this.adminMessages.set(messageId, message);
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async deleteAdminMessage(messageId: string): Promise<boolean> {
    return this.adminMessages.delete(messageId);
  }
}

export const storage = new MemStorage();
