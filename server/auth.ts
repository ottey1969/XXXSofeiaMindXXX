import crypto from 'crypto';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import type { User, InsertUser } from '@shared/schema';

export class AuthService {
  
  async registerUser(email: string): Promise<User> {
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new Error('Email already registered and verified');
      }
      // Return existing unverified user
      return existingUser;
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        credits: 3,
        emailVerified: false,
      })
      .returning();

    return user;
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