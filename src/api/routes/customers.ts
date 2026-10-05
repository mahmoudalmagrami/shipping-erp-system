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
  // جلب كافة العملاء
  fastify.get('/', { preHandler: [authenticate] }, async () => {
    const customers = await CustomerRepository.getAll();
    return { success: true, count: customers.length, data: customers };
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
}
