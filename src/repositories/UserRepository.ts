import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import type { User, NewUser } from '../domain/types/index.js';

export class UserRepository {
  static async getAll(): Promise<Omit<User, 'passwordHash' | 'salt'>[]> {
    const list = await db.select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    }).from(users);
    return list as any;
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  static async findById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  static async createUser(data: NewUser): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0]!;
  }

  static async update(id: number, data: { fullName?: string; role?: any }): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  static async toggleActive(id: number): Promise<User | undefined> {
    const user = await UserRepository.findById(id);
    if (!user) return undefined;
    const result = await db.update(users).set({ isActive: !user.isActive }).where(eq(users.id, id)).returning();
    return result[0];
  }

  static async updatePassword(id: number, passwordHash: string, salt: string): Promise<User | undefined> {
    const result = await db.update(users).set({ passwordHash, salt }).where(eq(users.id, id)).returning();
    return result[0];
  }
}
