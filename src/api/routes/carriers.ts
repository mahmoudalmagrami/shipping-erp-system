import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { CarrierRepository } from '../../repositories/CarrierRepository.js';

const carrierSchema = z.object({
  name: z.string().min(2, 'اسم الناقل إلزامي'),
  nameEn: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  carrierCode: z.string().optional(),
});

export default async function carriersRoutes(fastify: FastifyInstance) {
  // جلب كافة الناقلين مع الترقيم والبحث
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
      CarrierRepository.getAllPaginated({
        search: query.search,
        limit,
        offset,
      }),
      CarrierRepository.count(query.search),
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

  // تفاصيل ناقل محدد
  fastify.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const carrierId = Number(id);
    if (isNaN(carrierId)) {
      return reply.status(400).send({ success: false, error: 'معرّف الناقل غير صالح' });
    }
    const carrier = await CarrierRepository.getById(carrierId);
    if (!carrier) {
      return reply.status(404).send({ success: false, error: 'الناقل غير موجود' });
    }
    return { success: true, data: carrier };
  });

  // إضافة ناقل / مورد جديد
  fastify.post('/', { preHandler: [authenticate, requireRole(['admin'])] }, async (request) => {
    const data = carrierSchema.parse(request.body);
    const carrier = await CarrierRepository.create(data as any);
    return { success: true, message: 'تم إضافة شركة الشحن بنجاح', data: carrier };
  });

  // تعديل بيانات ناقل
  fastify.put('/:id', { preHandler: [authenticate, requireRole(['admin'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const carrierId = Number(id);
    if (isNaN(carrierId)) {
      return reply.status(400).send({ success: false, error: 'معرّف الناقل غير صالح' });
    }
    const data = carrierSchema.partial().parse(request.body);
    const carrier = await CarrierRepository.update(carrierId, data as any);
    return { success: true, message: 'تم تحديث بيانات الناقل بنجاح', data: carrier };
  });

  // حذف ناقل
  fastify.delete('/:id', { preHandler: [authenticate, requireRole(['admin'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const carrierId = Number(id);
    if (isNaN(carrierId)) {
      return reply.status(400).send({ success: false, error: 'معرّف الناقل غير صالح' });
    }

    const carrier = await CarrierRepository.getById(carrierId);
    if (!carrier) {
      return reply.status(404).send({ success: false, error: 'الناقل غير موجود' });
    }

    if (Number(carrier.currentBalance || 0) !== 0) {
      return reply.status(400).send({ 
        success: false, 
        error: `لا يمكن حذف الناقل لوجود مستحقات مالية قائمة (${carrier.currentBalance} ر.ي). يجب تصفية الحساب أولاً.` 
      });
    }

    const deleted = await CarrierRepository.delete(carrierId);
    if (!deleted) {
      return reply.status(404).send({ success: false, error: 'الناقل غير موجود' });
    }
    return { success: true, message: 'تم حذف الناقل بنجاح' };
  });

  // كشف حساب الناقل (متاح للإدارة والمحاسب فقط)
  fastify.get('/:id/statement', { preHandler: [authenticate, requireRole(['admin', 'accountant'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const carrierId = Number(id);
    if (isNaN(carrierId)) {
      return reply.status(400).send({ success: false, error: 'معرّف الناقل غير صالح' });
    }
    const statement = await CarrierRepository.getStatement(carrierId);
    if (!statement) {
      return reply.status(404).send({ success: false, error: 'الناقل غير موجود' });
    }
    return { success: true, data: statement };
  });
}
