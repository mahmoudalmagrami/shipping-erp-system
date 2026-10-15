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
  fastify.post('/:id/cancel', { preHandler: [authenticate, requireRole(['admin', 'cashier'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return reply.status(400).send({ success: false, error: 'معرّف الطلب غير صالح' });
    }
    const result = await CancelOrder.execute({ orderId });
    fastify.broadcastUpdate('order_cancelled', result);
    return { success: true, message: 'تم إلغاء الطلب بنجاح وعكس الأثر المحاسبي', data: result };
  });

  // استعراض كافة الطلبات مع الفرز والبحث والترقيم
  fastify.get('/', { preHandler: [authenticate] }, async (request) => {
    const query = request.query as {
      status?: any;
      search?: string;
      page?: string | number;
      pageSize?: string | number;
    };

    const hasPagination = query.page !== undefined || query.pageSize !== undefined;
    const page = query.page ? Math.max(1, Number(query.page)) : 1;
    const pageSize = query.pageSize ? Math.max(1, Math.min(100, Number(query.pageSize))) : 25;
    const offset = hasPagination ? (page - 1) * pageSize : undefined;
    const limit = hasPagination ? pageSize : undefined;

    const [orders, total] = await Promise.all([
      OrderRepository.getAll({
        status: query.status,
        search: query.search,
        limit,
        offset,
      }),
      OrderRepository.count({
        status: query.status,
        search: query.search,
      }),
    ]);

    return {
      success: true,
      count: orders.length,
      total,
      page,
      pageSize: limit || orders.length,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      data: orders,
    };
  });

  // استعراض الطلبات المعلقة للترحيل
  fastify.get('/pending-dispatch', { preHandler: [authenticate] }, async () => {
    const pending = await OrderRepository.getPendingDispatch();
    return { success: true, count: pending.length, data: pending };
  });

  // تفاصيل طلب محدد
  fastify.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return reply.status(400).send({ success: false, error: 'معرّف الطلب غير صالح' });
    }
    const order = await OrderRepository.getById(orderId);
    if (!order) {
      throw new NotFoundError('الطلب غير موجود');
    }
    return { success: true, data: order };
  });
}
