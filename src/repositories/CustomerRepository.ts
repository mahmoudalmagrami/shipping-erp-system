import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { customers } from '../db/schema.js';
import type { Customer, NewCustomer } from '../domain/types/index.js';

export class CustomerRepository {
  static async getAll(txOrDb: any = db): Promise<Customer[]> {
    return txOrDb.select().from(customers);
  }

  static async getById(id: number, txOrDb: any = db): Promise<Customer | undefined> {
    const result = await txOrDb.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  static async create(data: Omit<NewCustomer, 'customerCode'>, txOrDb: any = db): Promise<Customer> {
    const customerCode = CustomerRepository.generateCustomerCode();
    const result = await txOrDb.insert(customers).values({ ...data, customerCode }).returning();
    return result[0]!;
  }

  static async updateBalance(id: number, amount: number, txOrDb: any = db): Promise<Customer> {
    const result = await txOrDb
      .update(customers)
      .set({ currentBalance: sql`${customers.currentBalance} + ${amount}` })
      .where(eq(customers.id, id))
      .returning();
    return result[0]!;
  }

  static generateCustomerCode(): string {
    const prefix = 'CUST';
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}_${random}`;
  }
}
