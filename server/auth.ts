import crypto from 'crypto';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import type { User, InsertUser } from '@shared/schema';

export class AuthService {
  
  async registerUser(email: string): Promise<{ user: User; verificationToken: string }> {
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new Error('Email already registered and verified');
      }
      // Resend verification for unverified user
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const [updatedUser] = await db
        .update(users)
        .set({ verificationToken })
        .where(eq(users.id, existingUser.id))
        .returning();
      
      return { user: updatedUser, verificationToken };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const [user] = await db
      .insert(users)
      .values({
        email,
        credits: 3,
        emailVerified: false,
        verificationToken,
      })
      .returning();

    return { user, verificationToken };
  }

  async verifyEmail(token: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ 
        emailVerified: true, 
        verificationToken: null 
      })
      .where(eq(users.verificationToken, token))
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

  async generateVerificationToken(userId: string): Promise<{ verificationToken: string }> {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await db
      .update(users)
      .set({ verificationToken })
      .where(eq(users.id, userId));
    
    return { verificationToken };
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
}

export const authService = new AuthService();