import { Router } from 'express';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { db } from '../../config/database.js';
import { authenticate } from '../middlewares/auth.js';

export const customersRouter = Router();
customersRouter.use(authenticate);

customersRouter.get('/', (req, res, next) => {
  try {
    const customers = OrderRepository.getCustomers();
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    next(err);
  }
});

customersRouter.post('/', (req, res, next) => {
  try {
    const { fullName, phone, address } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ success: false, message: 'اسم العميل ورقم الهاتف إلزاميان' });
    }

    const maxRow = db.prepare('SELECT MAX(id) as maxId FROM customers').get();
    const customerCode = `CUST-${1001 + (maxRow.maxId || 0)}`;

    const resDb = db.prepare(`
      INSERT INTO customers (customer_code, full_name, phone, address, current_balance)
      VALUES (?, ?, ?, ?, 0.00)
    `).run(customerCode, fullName, phone, address || null);

    res.status(201).json({
      success: true,
      message: 'تم إضافة العميل بنجاح',
      data: {
        id: Number(resDb.lastInsertRowid),
        customerCode,
        fullName,
        phone,
        address
      }
    });
  } catch (err) {
    next(err);
  }
});
