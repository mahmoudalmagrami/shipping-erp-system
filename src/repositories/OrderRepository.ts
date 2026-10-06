import { eq, desc, and, or, ilike } from 'drizzle-orm';
import { db } from '../db/index.js';
import { initialOrders, destinationZones, finalShipments, carrierSuppliers } from '../db/schema.js';
import type { InitialOrder, NewInitialOrder, OrderStatus, FinalShipment, NewFinalShipment } from '../domain/types/index.js';

export class OrderRepository {
  static async getAll(filters?: { status?: OrderStatus; search?: string }, txOrDb: any = db) {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(initialOrders.status, filters.status));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(initialOrders.orderNumber, searchTerm),
          ilike(initialOrders.senderName, searchTerm),
          ilike(initialOrders.receiverName, searchTerm),
          ilike(finalShipments.supplierWaybillNumber, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await txOrDb
      .select({
        order: initialOrders,
        zone: destinationZones,
        shipment: finalShipments,
        carrier: carrierSuppliers,
      })
      .from(initialOrders)
      .leftJoin(destinationZones, eq(initialOrders.zoneId, destinationZones.id))
      .leftJoin(finalShipments, eq(initialOrders.id, finalShipments.initialOrderId))
      .leftJoin(carrierSuppliers, eq(finalShipments.carrierId, carrierSuppliers.id))
      .where(whereClause)
      .orderBy(desc(initialOrders.id));

    return rows.map((r: any) => ({
      ...r.order,
      amount: Number(r.order.totalSalesAmount || 0),
      zoneName: r.zone?.nameAr,
      zoneNameEn: r.zone?.nameEn,
      carrierName: r.carrier?.name,
      carrierId: r.shipment?.carrierId,
      waybillNumber: r.shipment?.supplierWaybillNumber,
      supplierWaybillNumber: r.shipment?.supplierWaybillNumber,
      carrierCost: r.shipment ? Number(r.shipment.carrierCost) : undefined,
      grossProfit: r.shipment ? Number(r.shipment.grossProfit) : undefined,
      dispatchedAt: r.shipment?.dispatchedAt,
    }));
  }

  static async getById(id: number, txOrDb: any = db): Promise<InitialOrder | undefined> {
    const result = await txOrDb.select().from(initialOrders).where(eq(initialOrders.id, id)).limit(1);
    return result[0];
  }

  static async getPendingDispatch(txOrDb: any = db): Promise<any[]> {
    const rows = await txOrDb
      .select({
        order: initialOrders,
        zone: destinationZones,
      })
      .from(initialOrders)
      .leftJoin(destinationZones, eq(initialOrders.zoneId, destinationZones.id))
      .where(eq(initialOrders.status, 'initial'))
      .orderBy(desc(initialOrders.id));

    return rows.map((r: any) => ({
      ...r.order,
      amount: Number(r.order.totalSalesAmount || 0),
      zoneName: r.zone?.nameAr,
      zoneNameEn: r.zone?.nameEn,
    }));
  }

  static async create(data: NewInitialOrder, txOrDb: any = db): Promise<InitialOrder> {
    const result = await txOrDb.insert(initialOrders).values(data).returning();
    return result[0]!;
  }

  static async update(id: number, data: Partial<NewInitialOrder>, txOrDb: any = db): Promise<InitialOrder> {
    const result = await txOrDb
      .update(initialOrders)
      .set(data)
      .where(eq(initialOrders.id, id))
      .returning();
    return result[0]!;
  }

  static async updateStatus(id: number, status: OrderStatus, txOrDb: any = db): Promise<InitialOrder> {
    const result = await txOrDb
      .update(initialOrders)
      .set({ status })
      .where(eq(initialOrders.id, id))
      .returning();
    return result[0]!;
  }

  static async findByWaybill(waybill: string, txOrDb: any = db): Promise<FinalShipment | undefined> {
    const result = await txOrDb
      .select()
      .from(finalShipments)
      .where(eq(finalShipments.supplierWaybillNumber, waybill))
      .limit(1);
    return result[0];
  }

  static async createFinalShipment(data: NewFinalShipment, txOrDb: any = db): Promise<FinalShipment> {
    const result = await txOrDb.insert(finalShipments).values(data).returning();
    return result[0]!;
  }

  static generateOrderNumber(): string {
    const prefix = 'ORD';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${date}-${random}`;
  }
}
