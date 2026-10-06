import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { carrierSuppliers } from '../db/schema.js';
import type { CarrierSupplier } from '../domain/types/index.js';

export class CarrierRepository {
  static async getAll(txOrDb: any = db): Promise<CarrierSupplier[]> {
    return txOrDb.select().from(carrierSuppliers);
  }

  static async getById(id: number, txOrDb: any = db): Promise<CarrierSupplier | undefined> {
    const result = await txOrDb.select().from(carrierSuppliers).where(eq(carrierSuppliers.id, id)).limit(1);
    return result[0];
  }

  static async updateBalance(id: number, amount: number, txOrDb: any = db): Promise<CarrierSupplier> {
    const result = await txOrDb
      .update(carrierSuppliers)
      .set({ currentBalance: sql`${carrierSuppliers.currentBalance} + ${amount}` })
      .where(eq(carrierSuppliers.id, id))
      .returning();
    return result[0]!;
  }

  static async create(data: { name: string; phone?: string; nameEn?: string; carrierCode?: string }, txOrDb: any = db): Promise<CarrierSupplier> {
    const carrierCode = data.carrierCode || `CAR_${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const result = await txOrDb.insert(carrierSuppliers).values({
      carrierCode,
      name: data.name,
      nameEn: data.nameEn || null,
      phone: data.phone || null,
      currentBalance: '0.00',
    }).returning();
    return result[0]!;
  }

  static async update(id: number, data: { name?: string; phone?: string; nameEn?: string }, txOrDb: any = db): Promise<CarrierSupplier> {
    const result = await txOrDb
      .update(carrierSuppliers)
      .set(data)
      .where(eq(carrierSuppliers.id, id))
      .returning();
    return result[0]!;
  }
}
