import { db } from "./db";
import { users, taxReturns, type User, type InsertUser, type TaxReturn, type InsertTaxReturn } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  createReturn(data: InsertTaxReturn): Promise<TaxReturn>;
  getReturn(id: number, userId: number): Promise<TaxReturn | undefined>;
  listReturns(userId: number): Promise<TaxReturn[]>;
  updateReturnData(id: number, userId: number, returnData: any): Promise<TaxReturn | undefined>;
  deleteReturn(id: number, userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createReturn(data: InsertTaxReturn): Promise<TaxReturn> {
    const [newReturn] = await db.insert(taxReturns).values(data).returning();
    return newReturn;
  }

  async getReturn(id: number, userId: number): Promise<TaxReturn | undefined> {
    const [ret] = await db.select().from(taxReturns)
      .where(and(eq(taxReturns.id, id), eq(taxReturns.userId, userId)));
    return ret;
  }

  async listReturns(userId: number): Promise<TaxReturn[]> {
    return await db.select().from(taxReturns)
      .where(eq(taxReturns.userId, userId))
      .orderBy(desc(taxReturns.updatedAt));
  }

  async updateReturnData(id: number, userId: number, returnData: any): Promise<TaxReturn | undefined> {
    const [updated] = await db.update(taxReturns)
      .set({ returnData, updatedAt: new Date() })
      .where(and(eq(taxReturns.id, id), eq(taxReturns.userId, userId)))
      .returning();
    return updated;
  }

  async deleteReturn(id: number, userId: number): Promise<void> {
    await db.delete(taxReturns)
      .where(and(eq(taxReturns.id, id), eq(taxReturns.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
