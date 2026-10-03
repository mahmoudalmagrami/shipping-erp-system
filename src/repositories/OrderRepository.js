import { db } from '../config/database.js';

export class OrderRepository {
  static getAllOrders({ status, search } = {}) {
    let query = `
      SELECT 
        o.*,
        z.name_ar as zone_name,
        z.name_en as zone_name_en,
        c.name as carrier_name,
        c.name_en as carrier_name_en,
        f.supplier_waybill_number,
        f.carrier_cost,
        f.gross_profit,
        f.dispatched_at
      FROM initial_orders o
      LEFT JOIN destination_zones z ON o.zone_id = z.id
      LEFT JOIN final_shipments f ON o.id = f.initial_order_id
      LEFT JOIN carrier_suppliers c ON f.carrier_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (
        o.order_number LIKE ? OR 
        o.sender_name LIKE ? OR 
        o.receiver_name LIKE ? OR 
        f.supplier_waybill_number LIKE ?
      )`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY o.id DESC`;
    return db.prepare(query).all(...params);
  }

  static getOrderById(id) {
    return db.prepare(`
      SELECT 
        o.*,
        z.name_ar as zone_name,
        z.name_en as zone_name_en,
        c.name as carrier_name,
        c.name_en as carrier_name_en,
        f.supplier_waybill_number,
        f.carrier_cost,
        f.gross_profit,
        f.dispatched_at
      FROM initial_orders o
      LEFT JOIN destination_zones z ON o.zone_id = z.id
      LEFT JOIN final_shipments f ON o.id = f.initial_order_id
      LEFT JOIN carrier_suppliers c ON f.carrier_id = c.id
      WHERE o.id = ?
    `).get(id);
  }

  static getPendingDispatchOrders() {
    return db.prepare(`
      SELECT 
        o.*,
        z.name_ar as zone_name,
        z.name_en as zone_name_en
      FROM initial_orders o
      JOIN destination_zones z ON o.zone_id = z.id
      WHERE o.status = 'initial'
      ORDER BY o.id ASC
    `).all();
  }

  static getZonesWithTiers() {
    const zones = db.prepare('SELECT * FROM destination_zones ORDER BY id ASC').all();
    const getTiers = db.prepare('SELECT * FROM pricing_matrix WHERE zone_id = ? AND is_active = 1 ORDER BY weight_min_kg ASC');

    return zones.map(z => ({
      ...z,
      tiers: getTiers.all(z.id)
    }));
  }

  static getCarriers() {
    return db.prepare('SELECT * FROM carrier_suppliers ORDER BY id ASC').all();
  }

  static getCustomers() {
    return db.prepare('SELECT * FROM customers ORDER BY id ASC').all();
  }
}
