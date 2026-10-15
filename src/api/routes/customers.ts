import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { CustomerRepository } from '../../repositories/CustomerRepository.js';

const customerSchema = z.object({
  fullName: z.string().min(2, 'اسم العميل إلزامي'),
  phone: z.string().min(6, 'رقم الجوال إلزامي'),
  address: z.string().optional().nullable(),
});

export default async function customersRoutes(fastify: FastifyInstance) {
  // جلب كافة العملاء مع الترقيم والبحث
  fastify.get('/', { preHandler: [authenticate] }, async (request) => {
    const query = request.query as {
      search?: string;
      page?: string | number;
      pageSize?: string | number;
    };

    const hasPagination = query.page !== undefined || query.pageSize !== undefined;
    const page = query.page ? Math.max(1, Number(query.page)) : 1;
    const pageSize = query.pageSize ? Math.max(1, Math.min(100, Number(query.pageSize))) : 25;
    const offset = hasPagination ? (page - 1) * pageSize : undefined;
    const limit = hasPagination ? pageSize : undefined;

    const [items, total] = await Promise.all([
      CustomerRepository.getAllPaginated({
        search: query.search,
        limit,
        offset,
      }),
      CustomerRepository.count(query.search),
    ]);

    return {
      success: true,
      count: items.length,
      total,
      page,
      pageSize: limit || items.length,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      data: items,
    };
  });

  // إضافة عميل جديد
  fastify.post('/', { preHandler: [authenticate, requireRole(['admin', 'cashier'])] }, async (request) => {
    const data = customerSchema.parse(request.body);
    const customer = await CustomerRepository.create({
      fullName: data.fullName,
      phone: data.phone,
      address: data.address || null,
      currentBalance: '0.00',
    });
    return { success: true, message: 'تم إضافة العميل بنجاح', data: customer };
  });

  // تفاصيل عميل محدد
  fastify.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const customerId = Number(id);
    if (isNaN(customerId)) {
      return reply.status(400).send({ success: false, error: 'معرّف العميل غير صالح' });
    }
    const customer = await CustomerRepository.getById(customerId);
    if (!customer) {
      return reply.status(404).send({ success: false, error: 'العميل غير موجود' });
    }
    return { success: true, data: customer };
  });

  // تعديل بيانات عميل
  fastify.put('/:id', { preHandler: [authenticate, requireRole(['admin', 'cashier'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const customerId = Number(id);
    if (isNaN(customerId)) {
      return reply.status(400).send({ success: false, error: 'معرّف العميل غير صالح' });
    }
    const data = customerSchema.partial().parse(request.body);
    const updated = await CustomerRepository.update(customerId, data as any);
    if (!updated) {
      return reply.status(404).send({ success: false, error: 'العميل غير موجود' });
    }
    return { success: true, message: 'تم تحديث بيانات العميل بنجاح', data: updated };
  });

  // حذف عميل
  fastify.delete('/:id', { preHandler: [authenticate, requireRole(['admin'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const customerId = Number(id);
    if (isNaN(customerId)) {
      return reply.status(400).send({ success: false, error: 'معرّف العميل غير صالح' });
    }

    const customer = await CustomerRepository.getById(customerId);
    if (!customer) {
      return reply.status(404).send({ success: false, error: 'العميل غير موجود' });
    }

    if (Number(customer.currentBalance || 0) !== 0) {
      return reply.status(400).send({ 
        success: false, 
        error: `لا يمكن حذف العميل لوجود رصيد مالي قائم بذمته (${customer.currentBalance} ر.ي). يجب تصفية الحساب أولاً.` 
      });
    }

    const deleted = await CustomerRepository.delete(customerId);
    if (!deleted) {
      return reply.status(404).send({ success: false, error: 'العميل غير موجود' });
    }
    return { success: true, message: 'تم حذف العميل بنجاح' };
  });

  // كشف حساب العميل (متاح للإدارة والمحاسب والكاشير فقط)
  fastify.get('/:id/statement', { preHandler: [authenticate, requireRole(['admin', 'accountant', 'cashier'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const customerId = Number(id);
    if (isNaN(customerId)) {
      return reply.status(400).send({ success: false, error: 'معرّف العميل غير صالح' });
    }
    const statement = await CustomerRepository.getStatement(customerId);
    if (!statement) {
      return reply.status(404).send({ success: false, error: 'العميل غير موجود' });
    }
    return { success: true, data: statement };
  });
}
