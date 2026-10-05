import { desc, eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { journalEntries, journalLines, cashMovements } from '../db/schema.js';
import type { JournalEntry, NewJournalEntry, JournalLine, NewJournalLine, CashMovement, NewCashMovement } from '../domain/types/index.js';

export class JournalRepository {
  static async createEntry(data: NewJournalEntry, txOrDb: any = db): Promise<JournalEntry> {
    const result = await txOrDb.insert(journalEntries).values(data).returning();
    return result[0]!;
  }

  static async createLine(data: NewJournalLine, txOrDb: any = db): Promise<JournalLine> {
    const result = await txOrDb.insert(journalLines).values(data).returning();
    return result[0]!;
  }

  static async getRecentEntries(limit: number = 10, txOrDb: any = db): Promise<JournalEntry[]> {
    return txOrDb.select().from(journalEntries).orderBy(desc(journalEntries.id)).limit(limit);
  }

  static async getLinesByEntryId(id: number, txOrDb: any = db): Promise<JournalLine[]> {
    return txOrDb.select().from(journalLines).where(eq(journalLines.journalEntryId, id));
  }

  static async findByReference(referenceType: string, referenceId: string, txOrDb: any = db): Promise<JournalEntry | undefined> {
    const result = await txOrDb
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.referenceType, referenceType), eq(journalEntries.referenceId, referenceId)))
      .limit(1);
    return result[0];
  }

  static generateEntryNumber(): string {
    const prefix = 'JRN';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${prefix}-${date}-${random}`;
  }

  static async createCashMovement(data: NewCashMovement, txOrDb: any = db): Promise<CashMovement> {
    const result = await txOrDb.insert(cashMovements).values(data).returning();
    return result[0]!;
  }

  static async getRecentCashMovements(limit: number = 10, txOrDb: any = db): Promise<CashMovement[]> {
    return txOrDb.select().from(cashMovements).orderBy(desc(cashMovements.id)).limit(limit);
  }
}
