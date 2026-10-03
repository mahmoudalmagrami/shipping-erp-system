import { Router } from 'express';
import { CreateInitialOrderUseCase } from '../../use-cases/CreateInitialOrder.js';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { authenticate, requireRole } from '../middlewares/auth.js';

export const ordersRouter = Router();
ordersRouter.use(authenticate);

// 1. إنشاء وحفظ طلب أولي جديد مع التأثير المالي اللحظي
ordersRouter.post('/', (req, res, next) => {
  try {
    const result = CreateInitialOrderUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      message: `تم إنشاء الطلب الأولي برقم [${result.orderNumber}] بنجاح، وتسجيل القيد المحاسبي [${result.journalEntryNumber}]`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// 2. استعراض كافة الطلبات مع الفرز والبحث
ordersRouter.get('/', (req, res, next) => {
  try {
    const { status, search } = req.query;
    const orders = OrderRepository.getAllOrders({ status, search });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
});

// 3. استعراض الطلبات الأولية المعلقة بالمستودع بانتظار الترحيل للنهائي
ordersRouter.get('/pending-dispatch', (req, res, next) => {
  try {
    const pending = OrderRepository.getPendingDispatchOrders();
    res.json({ success: true, count: pending.length, data: pending });
  } catch (err) {
    next(err);
  }
});

// 4. استعراض تفاصيل طلب معين
ordersRouter.get('/:id', (req, res, next) => {
  try {
    const order = OrderRepository.getOrderById(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});
