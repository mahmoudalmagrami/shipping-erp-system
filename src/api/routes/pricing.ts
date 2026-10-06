import type { FastifyInstance } from 'fastify';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { destinationZones, pricingMatrix } from '../../db/schema.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { CalculateRate } from '../../use-cases/CalculateRate.js';

export default async function pricingRoutes(fastify: FastifyInstance) {
  // جلب كافة الوجهات مع شرائح أسعارها
  fastify.get('/zones', { preHandler: [authenticate] }, async () => {
    const zones = await db.select().from(destinationZones).orderBy(asc(destinationZones.id));
    const zonesWithTiers = await Promise.all(
      zones.map(async (zone) => {
        const tiers = await db
          .select()
          .from(pricingMatrix)
          .where(eq(pricingMatrix.zoneId, zone.id))
          .orderBy(asc(pricingMatrix.weightMinKg));
        return {
          ...zone,
          name: zone.nameAr,
          tiers: tiers.map((t) => ({
            ...t,
            name: t.tierName,
            minWeight: Number(t.weightMinKg),
            maxWeight: Number(t.weightMaxKg),
            basePrice: Number(t.baseSellingPrice),
            extraKgPrice: Number(t.extraKgPrice),
            estCost: Number(t.estimatedCost),
          })),
        };
      })
    );
    return { success: true, data: zonesWithTiers };
  });

  // حاسبة تسعير فورية للوزن والوجهة والأبعاد
  fastify.post('/calculate', { preHandler: [authenticate] }, async (request) => {
    const result = await CalculateRate.execute(request.body);
    return { success: true, data: result };
  });

  // تعديل شريحة تسعير (للمدير العام فقط)
  fastify.put('/tiers/:id', { preHandler: [authenticate, requireRole(['admin'])] }, async (request) => {
    const { id } = request.params as { id: string };
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
      .where(eq(pricingMatrix.id, Number(id)))
      .returning();

    return { success: true, message: 'تم تحديث شريحة التسعير بنجاح', data: updated[0] };
  });
}
