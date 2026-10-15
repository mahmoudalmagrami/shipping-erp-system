import { eq, sql, desc, or, ilike } from 'drizzle-orm';
import { db } from '../db/index.js';
import { customers, initialOrders, journalEntries } from '../db/schema.js';
import type { Customer, NewCustomer } from '../domain/types/index.js';

export class CustomerRepository {
  static async getAll(txOrDb: any = db): Promise<Customer[]> {
    return txOrDb.select().from(customers).orderBy(desc(customers.id));
  }

  static async getAllPaginated(
    params?: { search?: string; limit?: number; offset?: number },
    txOrDb: any = db
  ): Promise<Customer[]> {
    let query = txOrDb.select().from(customers);

    if (params?.search) {
      const s = `%${params.search}%`;
      query = query.where(
        or(
          ilike(customers.fullName, s),
          ilike(customers.phone, s),
          ilike(customers.customerCode, s)
        )
      );
    }

    query = query.orderBy(desc(customers.id));

    if (params?.limit) query = query.limit(params.limit);
    if (params?.offset) query = query.offset(params.offset);

    return query;
  }

  static async count(search?: string, txOrDb: any = db): Promise<number> {
    let query = txOrDb.select({ count: sql`COUNT(*)` }).from(customers);

    if (search) {
      const s = `%${search}%`;
      query = query.where(
        or(
          ilike(customers.fullName, s),
          ilike(customers.phone, s),
          ilike(customers.customerCode, s)
        )
      );
    }

    const [res] = await query;
    return Number(res?.count || 0);
  }

  static async getById(id: number, txOrDb: any = db): Promise<Customer | undefined> {
    const result = await txOrDb.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  static async create(data: Omit<NewCustomer, 'customerCode'>, txOrDb: any = db): Promise<Customer> {
    const customerCode = await CustomerRepository.generateCustomerCode(txOrDb);
    const result = await txOrDb.insert(customers).values({ ...data, customerCode }).returning();
    return result[0]!;
  }

  static async update(id: number, data: Partial<NewCustomer>, txOrDb: any = db): Promise<Customer | undefined> {
    const result = await txOrDb
      .update(customers)
      .set(data)
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: number, txOrDb: any = db): Promise<boolean> {
    const result = await txOrDb.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }

  static async updateBalance(id: number, amount: number, txOrDb: any = db): Promise<Customer> {
    const rounded = Math.round(amount * 100) / 100;
    const result = await txOrDb
      .update(customers)
      .set({ currentBalance: sql`${customers.currentBalance} + ${rounded}` })
      .where(eq(customers.id, id))
      .returning();
    return result[0]!;
  }

  static async getStatement(customerId: number, txOrDb: any = db) {
    const customer = await CustomerRepository.getById(customerId, txOrDb);
    if (!customer) return null;

    // Customer credit orders
    const orders = await txOrDb
      .select()
      .from(initialOrders)
      .where(eq(initialOrders.customerId, customerId))
      .orderBy(initialOrders.createdAt);

    // Customer receipt vouchers
    const vouchers = await txOrDb
      .select()
      .from(journalEntries)
      .where(
        sql`${journalEntries.referenceType} = 'receipt_voucher' AND ${journalEntries.referenceId} = ${customerId.toString()}`
      )
      .orderBy(journalEntries.entryDate);

    // Combine transactions into ledger items
    const transactions: Array<{
      date: Date | string | null;
      type: 'order' | 'voucher';
      reference: string;
      description: string;
      debit: number;  // Increases customer debt
      credit: number; // Payments reduce debt
    }> = [];

    for (const o of orders) {
      if (o.paymentType === 'credit' && o.status !== 'cancelled') {
        transactions.push({
          date: o.createdAt,
          type: 'order',
          reference: o.orderNumber,
          description: `شحنة بوليصة ${o.orderNumber} (آجل)`,
          debit: Number(o.totalSalesAmount),
          credit: 0,
        });
      }
    }

    for (const v of vouchers) {
      transactions.push({
        date: v.entryDate,
        type: 'voucher',
        reference: v.entryNumber,
        description: v.description,
        debit: 0,
        credit: Number(v.totalDebit),
      });
    }

    // Sort by date
    transactions.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

    // Calculate running balance
    let runningBalance = 0;
    const items = transactions.map((tx) => {
      runningBalance += (tx.debit - tx.credit);
      return {
        ...tx,
        balance: Math.round(runningBalance * 100) / 100,
      };
    });

    return {
      customer,
      totalDebits: Math.round(transactions.reduce((s, t) => s + t.debit, 0) * 100) / 100,
      totalCredits: Math.round(transactions.reduce((s, t) => s + t.credit, 0) * 100) / 100,
      currentBalance: Number(customer.currentBalance || 0),
      items,
    };
  }

  static async generateCustomerCode(txOrDb: any = db): Promise<string> {
    const prefix = 'CUST_';
    const [latest] = await txOrDb
      .select({ customerCode: customers.customerCode })
      .from(customers)
      .where(sql`customer_code LIKE ${prefix + '%'}`)
      .orderBy(desc(customers.customerCode))
      .limit(1);

    const nextSeq = latest
      ? String(parseInt(latest.customerCode.replace(/^CUST_/, '')) + 1).padStart(6, '0')
      : '000001';

    return `${prefix}${nextSeq}`;
  }
}
