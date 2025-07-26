import crypto from 'crypto';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import type { User, InsertUser } from '@shared/schema';

export class AuthService {
  
  async registerUser(email: string, ipAddress?: string, marketingConsent: boolean = false): Promise<User> {
    // Normalize email to prevent variations (gmail dots, plus addressing)
    const normalizedEmail = this.normalizeEmail(email);
    
    // Check for existing user with normalized email
    const existingUser = await this.getUserByEmail(normalizedEmail);
    if (existingUser) {
      // Always return existing user (no new credits for same email)
      return existingUser;
    }

    // Check for fraud prevention - limit accounts per IP
    if (ipAddress) {
      const recentAccountsFromIP = await this.getRecentAccountsByIP(ipAddress);
      if (recentAccountsFromIP >= 3) {
        throw new Error('Registration limit reached. Contact support for assistance.');
      }
    }

    // Check for suspicious email patterns
    if (this.isSuspiciousEmail(normalizedEmail)) {
      throw new Error('Invalid email format. Please use a valid email address.');
    }

    const [user] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        credits: 3,
        emailVerified: false,
        marketingConsent,
        ipAddress: ipAddress || null,
      })
      .returning();

    return user;
  }

  private normalizeEmail(email: string): string {
    const [localPart, domain] = email.toLowerCase().split('@');
    
    // Handle Gmail aliases (remove dots and plus addressing)
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      const cleanLocal = localPart.replace(/\./g, '').split('+')[0];
      return `${cleanLocal}@gmail.com`;
    }
    
    // Handle other common providers with plus addressing
    const cleanLocal = localPart.split('+')[0];
    return `${cleanLocal}@${domain}`;
  }

  private isSuspiciousEmail(email: string): boolean {
    // Check for temporary email providers
    const tempEmailDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 
      'tempmail.org', 'throwaway.email', 'getnada.com'
    ];
    
    const domain = email.split('@')[1];
    return tempEmailDomains.includes(domain);
  }

  private async getRecentAccountsByIP(ipAddress: string): Promise<number> {
    // Count accounts created from this IP in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`ip_address = ${ipAddress} AND created_at > ${oneDayAgo}`);
    
    return Number(result[0]?.count) || 0;
  }

  async verifyUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ 
        emailVerified: true
      })
      .where(eq(users.email, email))
      .returning();

    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user || null;
  }



  async useCredit(userId: string): Promise<{ success: boolean; remainingCredits: number }> {
    const user = await this.getUserById(userId);
    if (!user || user.credits <= 0) {
      return { success: false, remainingCredits: user?.credits || 0 };
    }

    const [updatedUser] = await db
      .update(users)
      .set({ credits: user.credits - 1 })
      .where(eq(users.id, userId))
      .returning();

    return { success: true, remainingCredits: updatedUser.credits };
  }

  async addCredits(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ credits: sql`credits + ${amount}` })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async deleteAllUsers(): Promise<{ deletedCount: number }> {
    const allUsers = await db.select().from(users);
    const count = allUsers.length;
    await db.delete(users);
    return { deletedCount: count };
  }
}

export const authService = new AuthService();