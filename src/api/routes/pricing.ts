import type { FastifyInstance } from 'fastify';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { destinationZones, pricingMatrix } from '../../db/schema.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { CalculateRate } from '../../use-cases/CalculateRate.js';

export default async function pricingRoutes(fastify: FastifyInstance) {
  // جلب كافة الوجهات مع شرائح أسعارها (استعلامان فقط بدون N+1)
  fastify.get('/zones', { preHandler: [authenticate] }, async () => {
    const [zones, allTiers] = await Promise.all([
      db.select().from(destinationZones).orderBy(asc(destinationZones.id)),
      db.select().from(pricingMatrix).orderBy(asc(pricingMatrix.weightMinKg)),
    ]);

    const tiersByZone = new Map<number, any[]>();
    for (const t of allTiers) {
      const list = tiersByZone.get(t.zoneId) || [];
      list.push({
        ...t,
        name: t.tierName,
        minWeight: Number(t.weightMinKg),
        maxWeight: Number(t.weightMaxKg),
        basePrice: Number(t.baseSellingPrice),
        extraKgPrice: Number(t.extraKgPrice),
        estCost: Number(t.estimatedCost),
      });
      tiersByZone.set(t.zoneId, list);
    }

    const zonesWithTiers = zones.map((zone) => ({
      ...zone,
      name: zone.nameAr,
      tiers: tiersByZone.get(zone.id) || [],
    }));

    return { success: true, data: zonesWithTiers };
  });

  // حاسبة تسعير فورية للوزن والوجهة والأبعاد
  fastify.post('/calculate', { preHandler: [authenticate] }, async (request) => {
    const result = await CalculateRate.execute(request.body);
    return { success: true, data: result };
  });

  // تعديل شريحة تسعير (للمدير العام فقط)
  fastify.put('/tiers/:id', { preHandler: [authenticate, requireRole(['admin'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const tierId = Number(id);
    if (isNaN(tierId)) {
      return reply.status(400).send({ success: false, error: 'معرّف الشريحة غير صالح' });
    }

    const tierSchema = z.object({
      baseSellingPrice: z.coerce.number().min(0, 'السعر الأساسي يجب أن يكون 0 أو أكثر'),
      extraKgPrice: z.coerce.number().min(0, 'سعر الكيلو الإضافي يجب أن يكون 0 أو أكثر'),
      estimatedCost: z.coerce.number().min(0, 'التكلفة التقديرية يجب أن تكون 0 أو أكثر'),
    });
    const data = tierSchema.parse(request.body);

    const updated = await db
      .update(pricingMatrix)
      .set({
        baseSellingPrice: data.baseSellingPrice.toFixed(2),
        extraKgPrice: data.extraKgPrice.toFixed(2),
        estimatedCost: data.estimatedCost.toFixed(2),
      })
      .where(eq(pricingMatrix.id, tierId))
      .returning();

    return { success: true, message: 'تم تحديث شريحة التسعير بنجاح', data: updated[0] };
  });
}
