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
  fastify.get('/', { preHandler: [authenticate] }, async () => {
    const carriers = await CarrierRepository.getAll();
    return { success: true, count: carriers.length, data: carriers };
  });

  // إضافة ناقل / مورد جديد
  fastify.post('/', { preHandler: [authenticate, requireRole(['admin'])] }, async (request) => {
    const data = carrierSchema.parse(request.body);
    const carrier = await CarrierRepository.create(data as any);
    return { success: true, message: 'تم إضافة شركة الشحن بنجاح', data: carrier };
  });

  // تعديل بيانات ناقل
  fastify.put('/:id', { preHandler: [authenticate, requireRole(['admin'])] }, async (request) => {
    const { id } = request.params as { id: string };
    const data = carrierSchema.partial().parse(request.body);
    const carrier = await CarrierRepository.update(Number(id), data as any);
    return { success: true, message: 'تم تحديث بيانات الناقل بنجاح', data: carrier };
  });
}
