import { eq, sql, desc, or, ilike } from 'drizzle-orm';
import { db } from '../db/index.js';
import { carrierSuppliers, finalShipments, initialOrders, journalEntries } from '../db/schema.js';
import type { CarrierSupplier } from '../domain/types/index.js';

export class CarrierRepository {
  static async getAll(txOrDb: any = db): Promise<CarrierSupplier[]> {
    return txOrDb.select().from(carrierSuppliers).orderBy(desc(carrierSuppliers.id));
  }

  static async getAllPaginated(
    params?: { search?: string; limit?: number; offset?: number },
    txOrDb: any = db
  ): Promise<CarrierSupplier[]> {
    let query = txOrDb.select().from(carrierSuppliers);

    if (params?.search) {
      const s = `%${params.search}%`;
      query = query.where(
        or(
          ilike(carrierSuppliers.name, s),
          ilike(carrierSuppliers.phone, s),
          ilike(carrierSuppliers.carrierCode, s)
        )
      );
    }

    query = query.orderBy(desc(carrierSuppliers.id));

    if (params?.limit) query = query.limit(params.limit);
    if (params?.offset) query = query.offset(params.offset);

    return query;
  }

  static async count(search?: string, txOrDb: any = db): Promise<number> {
    let query = txOrDb.select({ count: sql`COUNT(*)` }).from(carrierSuppliers);

    if (search) {
      const s = `%${search}%`;
      query = query.where(
        or(
          ilike(carrierSuppliers.name, s),
          ilike(carrierSuppliers.phone, s),
          ilike(carrierSuppliers.carrierCode, s)
        )
      );
    }

    const [res] = await query;
    return Number(res?.count || 0);
  }

  static async getById(id: number, txOrDb: any = db): Promise<CarrierSupplier | undefined> {
    const result = await txOrDb.select().from(carrierSuppliers).where(eq(carrierSuppliers.id, id)).limit(1);
    return result[0];
  }

  static async updateBalance(id: number, amount: number, txOrDb: any = db): Promise<CarrierSupplier> {
    const rounded = Math.round(amount * 100) / 100;
    const result = await txOrDb
      .update(carrierSuppliers)
      .set({ currentBalance: sql`${carrierSuppliers.currentBalance} + ${rounded}` })
      .where(eq(carrierSuppliers.id, id))
      .returning();
    return result[0]!;
  }

  static async create(data: { name: string; phone?: string; nameEn?: string; carrierCode?: string }, txOrDb: any = db): Promise<CarrierSupplier> {
    const carrierCode = data.carrierCode || await CarrierRepository.generateCarrierCode(txOrDb);
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

  static async delete(id: number, txOrDb: any = db): Promise<boolean> {
    const result = await txOrDb.delete(carrierSuppliers).where(eq(carrierSuppliers.id, id)).returning();
    return result.length > 0;
  }

  static async getStatement(carrierId: number, txOrDb: any = db) {
    const carrier = await CarrierRepository.getById(carrierId, txOrDb);
    if (!carrier) return null;

    // Shipments dispatched to this carrier
    const shipments = await txOrDb
      .select({
        shipment: finalShipments,
        order: initialOrders,
      })
      .from(finalShipments)
      .innerJoin(initialOrders, eq(finalShipments.initialOrderId, initialOrders.id))
      .where(eq(finalShipments.carrierId, carrierId))
      .orderBy(finalShipments.dispatchedAt);

    // Payment vouchers made to this carrier
    const vouchers = await txOrDb
      .select()
      .from(journalEntries)
      .where(
        sql`${journalEntries.referenceType} = 'payment_voucher' AND ${journalEntries.referenceId} = ${carrierId.toString()}`
      )
      .orderBy(journalEntries.entryDate);

    const transactions: Array<{
      date: Date | string | null;
      type: 'shipment' | 'voucher';
      reference: string;
      description: string;
      debit: number;  // Payments made to carrier reduce our liability
      credit: number; // Carrier cost increases our liability
    }> = [];

    for (const s of shipments) {
      transactions.push({
        date: s.shipment.dispatchedAt,
        type: 'shipment',
        reference: s.shipment.supplierWaybillNumber,
        description: `ترحيل شحنة [${s.order.orderNumber}] بوليصة مورد [${s.shipment.supplierWaybillNumber}]`,
        debit: 0,
        credit: Number(s.shipment.carrierCost),
      });
    }

    for (const v of vouchers) {
      transactions.push({
        date: v.entryDate,
        type: 'voucher',
        reference: v.entryNumber,
        description: v.description,
        debit: Number(v.totalDebit),
        credit: 0,
      });
    }

    transactions.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

    let runningBalance = 0;
    const items = transactions.map((tx) => {
      // In accounts payable: Credit increases liability, Debit decreases liability
      runningBalance += (tx.credit - tx.debit);
      return {
        ...tx,
        balance: Math.round(runningBalance * 100) / 100,
      };
    });

    return {
      carrier,
      totalCredits: Math.round(transactions.reduce((s, t) => s + t.credit, 0) * 100) / 100, // Total invoiced by carrier
      totalDebits: Math.round(transactions.reduce((s, t) => s + t.debit, 0) * 100) / 100,   // Total paid to carrier
      currentBalance: Number(carrier.currentBalance || 0),
      items,
    };
  }

  static async generateCarrierCode(txOrDb: any = db): Promise<string> {
    const prefix = 'CAR_';
    const [latest] = await txOrDb
      .select({ carrierCode: carrierSuppliers.carrierCode })
      .from(carrierSuppliers)
      .where(sql`carrier_code LIKE ${prefix + '%'}`)
      .orderBy(desc(carrierSuppliers.carrierCode))
      .limit(1);

    const nextSeq = latest
      ? String(parseInt(latest.carrierCode.replace(/^CAR_/, '')) + 1).padStart(5, '0')
      : '00001';

    return `${prefix}${nextSeq}`;
  }
}
