import type { FastifyInstance } from 'fastify';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { CreateInitialOrder } from '../../use-cases/CreateInitialOrder.js';
import { CancelOrder } from '../../use-cases/CancelOrder.js';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { NotFoundError } from '../../domain/errors/index.js';

export default async function ordersRoutes(fastify: FastifyInstance) {
  // إنشاء وحفظ طلب أولي جديد
  fastify.post('/', { preHandler: [authenticate, requireRole(['admin', 'cashier'])] }, async (request) => {
    const result = await CreateInitialOrder.execute(request.body);
    fastify.broadcastUpdate('order_created', result);
    return { success: true, message: `تم إنشاء الطلب برقم [${result.orderNumber}] بنجاح`, data: result };
  });

  // إلغاء طلب أولي مع قيد عكسي
  fastify.post('/:id/cancel', { preHandler: [authenticate, requireRole(['admin', 'cashier'])] }, async (request) => {
    const { id } = request.params as { id: string };
    const result = await CancelOrder.execute({ orderId: Number(id) });
    fastify.broadcastUpdate('order_cancelled', result);
    return { success: true, message: 'تم إلغاء الطلب بنجاح وعكس الأثر المحاسبي', data: result };
  });

  // استعراض كافة الطلبات مع الفرز والبحث
  fastify.get('/', { preHandler: [authenticate] }, async (request) => {
    const query = request.query as { status?: any; search?: string };
    const orders = await OrderRepository.getAll(query);
    return { success: true, count: orders.length, data: orders };
  });

  // استعراض الطلبات المعلقة للترحيل
  fastify.get('/pending-dispatch', { preHandler: [authenticate] }, async () => {
    const pending = await OrderRepository.getPendingDispatch();
    return { success: true, count: pending.length, data: pending };
  });

  // تفاصيل طلب محدد
  fastify.get('/:id', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const order = await OrderRepository.getById(Number(id));
    if (!order) {
      throw new NotFoundError('الطلب غير موجود');
    }
    return { success: true, data: order };
  });
}
