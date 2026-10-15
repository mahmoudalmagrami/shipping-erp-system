import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { chartOfAccounts } from '../db/schema.js';
import type { ChartOfAccount } from '../domain/types/index.js';

export class AccountRepository {
  static async getAll(txOrDb: any = db): Promise<ChartOfAccount[]> {
    return txOrDb.select().from(chartOfAccounts);
  }

  static async getByCode(code: string, txOrDb: any = db): Promise<ChartOfAccount | undefined> {
    const result = await txOrDb.select().from(chartOfAccounts).where(eq(chartOfAccounts.accountCode, code)).limit(1);
    return result[0];
  }

  static async updateBalance(code: string, amount: number, txOrDb: any = db): Promise<ChartOfAccount> {
    const rounded = Math.round(amount * 100) / 100;
    const result = await txOrDb
      .update(chartOfAccounts)
      .set({ currentBalance: sql`${chartOfAccounts.currentBalance} + ${rounded}` })
      .where(eq(chartOfAccounts.accountCode, code))
      .returning();
    return result[0]!;
  }
}
