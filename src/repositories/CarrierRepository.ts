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
}
