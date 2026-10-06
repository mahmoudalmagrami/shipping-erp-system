import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { GetDashboardAnalytics } from '../../use-cases/GetDashboardAnalytics.js';
import { YemeniDataSeeder } from '../../domain/services/YemeniDataSeeder.js';

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14),
});

export default async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get('/dashboard', { preHandler: [authenticate, requireRole(['admin'])] }, async (request) => {
    const query = querySchema.parse(request.query);
    const analytics = await GetDashboardAnalytics.execute(query.days);
    return { success: true, data: analytics };
  });

  fastify.post('/seed-demo-data', { preHandler: [authenticate, requireRole(['admin'])] }, async () => {
    const result = await YemeniDataSeeder.seed();
    fastify.broadcastUpdate('data_seeded', result);
    return result;
  });
}
