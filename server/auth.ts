import crypto from 'crypto';
import { db } from './db';
import { users, notifications } from '@shared/schema';
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



  async useCredit(userId: string): Promise<{ success: boolean; remainingCredits: number; remainingBonusCredits: number }> {
    const user = await this.getUserById(userId);
    if (!user || (user.credits <= 0 && (user.bonusCredits || 0) <= 0)) {
      return { success: false, remainingCredits: user?.credits || 0, remainingBonusCredits: user?.bonusCredits || 0 };
    }

    // Use bonus credits first if available, then regular credits
    let updateData: any = {};
    if ((user.bonusCredits || 0) > 0) {
      updateData.bonusCredits = user.bonusCredits! - 1;
    } else {
      updateData.credits = user.credits - 1;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return { 
      success: true, 
      remainingCredits: updatedUser.credits,
      remainingBonusCredits: updatedUser.bonusCredits || 0
    };
  }

  async addCredits(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ credits: sql`credits + ${amount}` })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  // Check and renew credits for eligible users (3 credits every 2 days + 5 bonus credits every 14 days)
  async checkAndRenewCredits(userId: string): Promise<{ renewed: boolean; bonusRenewed: boolean; newCredits: number; newBonusCredits: number }> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const lastRenewal = user.lastCreditRenewal ? new Date(user.lastCreditRenewal) : new Date(user.createdAt!);
    const lastBonusRenewal = user.lastBonusRenewal ? new Date(user.lastBonusRenewal) : new Date(user.createdAt!);
    
    const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days in milliseconds
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)); // 14 days in milliseconds

    let regularRenewed = false;
    let bonusRenewed = false;
    let updateData: any = { updatedAt: now };

    // Check if 2 days have passed since last regular renewal
    if (lastRenewal < twoDaysAgo) {
      updateData.credits = sql`credits + 3`;
      updateData.lastCreditRenewal = now;
      regularRenewed = true;
    }

    // Check if 14 days have passed since account creation - EXPIRE all bonus credits and restart cycle
    const accountAge = now.getTime() - new Date(user.createdAt!).getTime();
    const daysSinceCreation = Math.floor(accountAge / (24 * 60 * 60 * 1000));
    const currentCycle = Math.floor(daysSinceCreation / 14); // Which 14-day cycle are we in?
    
    // Calculate when the current 14-day cycle started
    const cycleStartDate = new Date(user.createdAt!);
    cycleStartDate.setDate(cycleStartDate.getDate() + (currentCycle * 14));
    
    // Check if we've moved to a new 14-day cycle and need to expire bonus credits
    const lastCycleStartFromBonus = user.lastBonusRenewal ? new Date(user.lastBonusRenewal) : new Date(user.createdAt!);
    const daysSinceLastBonus = Math.floor((now.getTime() - lastCycleStartFromBonus.getTime()) / (24 * 60 * 60 * 1000));
    
    // If 14+ days have passed since account creation and we have bonus credits, expire them
    if (daysSinceCreation >= 14 && user.bonusCredits! > 0) {
      const currentCycleFromCreation = Math.floor(daysSinceCreation / 14);
      const lastProcessedCycle = user.lastBonusRenewal ? 
        Math.floor((new Date(user.lastBonusRenewal).getTime() - new Date(user.createdAt!).getTime()) / (14 * 24 * 60 * 60 * 1000)) : -1;
      
      if (currentCycleFromCreation > lastProcessedCycle) {
        // New 14-day cycle started - expire all bonus credits
        updateData.bonusCredits = 0;
        updateData.lastBonusRenewal = cycleStartDate;
        bonusRenewed = true; // Mark as expired
      }
    }
    
    // Add 3 bonus credits every 2 days within the current 14-day cycle
    if (daysSinceCreation >= 2) { // Only start giving bonus after 2 days
      const daysInCurrentCycle = daysSinceCreation % 14;
      const lastBonusInCycle = user.lastBonusRenewal ? 
        Math.floor((new Date(user.lastBonusRenewal).getTime() - cycleStartDate.getTime()) / (24 * 60 * 60 * 1000)) : -1;
      
      // Give bonus credits on days 2, 4, 6, 8, 10, 12 within each 14-day cycle
      if (daysInCurrentCycle >= 2 && daysInCurrentCycle < 14) {
        const bonusDaysInCycle = Math.floor(daysInCurrentCycle / 2); // How many 2-day periods have passed
        const lastBonusDaysInCycle = Math.max(0, Math.floor(lastBonusInCycle / 2));
        
        if (bonusDaysInCycle > lastBonusDaysInCycle) {
          const creditsToAdd = (bonusDaysInCycle - lastBonusDaysInCycle) * 3;
          updateData.bonusCredits = sql`bonus_credits + ${creditsToAdd}`;
          updateData.lastBonusRenewal = now;
          bonusRenewed = true;
        }
      }
    }

    // Only update if there's something to renew
    if (regularRenewed || bonusRenewed) {
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      return {
        renewed: regularRenewed,
        bonusRenewed: bonusRenewed,
        newCredits: updatedUser.credits,
        newBonusCredits: updatedUser.bonusCredits
      };
    }

    return {
      renewed: false,
      bonusRenewed: false,
      newCredits: user.credits,
      newBonusCredits: user.bonusCredits || 0
    };
  }

  // Get next renewal date for a user
  async getNextRenewalDate(userId: string): Promise<Date | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const lastRenewal = user.lastCreditRenewal ? new Date(user.lastCreditRenewal) : new Date(user.createdAt!);
    return new Date(lastRenewal.getTime() + (2 * 24 * 60 * 60 * 1000)); // Add 2 days
  }

  async deleteAllUsers(): Promise<{ deletedCount: number }> {
    const allUsers = await db.select().from(users);
    const count = allUsers.length;
    await db.delete(users);
    return { deletedCount: count };
  }

  async sendWelcomeNotification(userId: string): Promise<void> {
    await db.insert(notifications).values({
      userId,
      title: "Welcome to Sofeia AI! 🎉",
      message: "Welcome to Sofeia AI by ContentScale! You've been granted 3 free credits to start creating high-quality, SEO-optimized content. Our advanced AI uses multi-provider routing (Groq, Perplexity, Claude) and the C.R.A.F.T framework to deliver superior content that outperforms competitors like BrandWell and Content at Scale. Need more credits? Contact us on WhatsApp at +31 6 2807 3996 or join our Facebook community for support and tips!",
      type: "success",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  }
}

export const authService = new AuthService();