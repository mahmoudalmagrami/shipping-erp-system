import type { FastifyInstance } from 'fastify';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { destinationZones, pricingMatrix } from '../../db/schema.js';
import { authenticate } from '../middlewares/auth.js';
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
          tiers,
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
}
