import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../../domain/services/AuthService.js';
import { authenticate } from '../middlewares/auth.js';

const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة')
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', async (request) => {
    const data = loginSchema.parse(request.body);
    const result = await AuthService.login(data.username, data.password);
    return { success: true, message: 'تم تسجيل الدخول بنجاح', data: result };
  });

  fastify.get('/me', { preHandler: [authenticate] }, async (request) => {
    return { success: true, data: { user: request.user } };
  });

  fastify.get('/roles', async () => {
    return {
      success: true,
      data: [
        { role: 'admin', titleAr: 'المدير العام', description: 'صلاحيات كاملة وغير مقيدة' },
        { role: 'cashier', titleAr: 'موظف الاستقبال / كاشير', description: 'حجز الطلب الأولي فقط وقبض الأموال' },
        { role: 'warehouse', titleAr: 'مسؤول المستودع والترحيل', description: 'تسليم الطرود للناقلين وتوثيق البوالص' },
        { role: 'accountant', titleAr: 'المحاسب المالي', description: 'دفتر الأستاذ والقيود ومستحقات الموردين' }
      ]
    };
  });
}
