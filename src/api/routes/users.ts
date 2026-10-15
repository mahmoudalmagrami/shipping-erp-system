import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { AuthService } from '../../domain/services/AuthService.js';

const createUserSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب ألا يقل عن 3 أحرف'),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
  fullName: z.string().min(2, 'الاسم الكامل إلزامي'),
  role: z.enum(['admin', 'cashier', 'warehouse', 'accountant']),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2, 'الاسم الكامل إلزامي').optional(),
  role: z.enum(['admin', 'cashier', 'warehouse', 'accountant']).optional(),
});

const changePasswordSchema = z.object({
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
});

export default async function usersRoutes(fastify: FastifyInstance) {
  // جميع المسارات هنا محصورة بالمدير العام فقط
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', requireRole(['admin']));

  // قائمة المستخدمين
  fastify.get('/', async () => {
    const list = await UserRepository.getAll();
    return { success: true, count: list.length, data: list };
  });

  // إضافة مستخدم جديد
  fastify.post('/', async (request, reply) => {
    const data = createUserSchema.parse(request.body);
    const existing = await UserRepository.findByUsername(data.username);
    if (existing) {
      return reply.status(400).send({ success: false, message: 'اسم المستخدم مسجل مسبقاً' });
    }

    const { hash, salt } = await AuthService.hashPasswordAsync(data.password);
    const created = await UserRepository.createUser({
      username: data.username,
      passwordHash: hash,
      salt,
      fullName: data.fullName,
      role: data.role,
      isActive: true,
    });

    return reply.status(201).send({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: {
        id: created.id,
        username: created.username,
        fullName: created.fullName,
        role: created.role,
        isActive: created.isActive,
      },
    });
  });

  // تعديل بيانات المستخدم
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = Number(id);
    if (isNaN(userId)) {
      return reply.status(400).send({ success: false, error: 'معرّف المستخدم غير صالح' });
    }

    const data = updateUserSchema.parse(request.body);
    const updated = await UserRepository.update(userId, data);
    if (!updated) {
      return reply.status(404).send({ success: false, error: 'المستخدم غير موجود' });
    }

    return {
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      data: {
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        role: updated.role,
        isActive: updated.isActive,
      },
    };
  });

  // تفعيل / تعطيل المستخدم
  fastify.put('/:id/toggle', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = Number(id);
    if (isNaN(userId)) {
      return reply.status(400).send({ success: false, error: 'معرّف المستخدم غير صالح' });
    }

    const updated = await UserRepository.toggleActive(userId);
    if (!updated) {
      return reply.status(404).send({ success: false, error: 'المستخدم غير موجود' });
    }

    const statusText = updated.isActive ? 'تفعيل' : 'تعطيل';
    return {
      success: true,
      message: `تم ${statusText} حساب المستخدم بنجاح`,
      data: {
        id: updated.id,
        username: updated.username,
        isActive: updated.isActive,
      },
    };
  });

  // تغيير كلمة المرور
  fastify.put('/:id/password', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = Number(id);
    if (isNaN(userId)) {
      return reply.status(400).send({ success: false, error: 'معرّف المستخدم غير صالح' });
    }

    const data = changePasswordSchema.parse(request.body);
    const { hash, salt } = await AuthService.hashPasswordAsync(data.password);
    const updated = await UserRepository.updatePassword(userId, hash, salt);
    if (!updated) {
      return reply.status(404).send({ success: false, error: 'المستخدم غير موجود' });
    }

    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
  });
}
