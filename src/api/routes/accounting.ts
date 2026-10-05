import type { FastifyInstance } from 'fastify';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { GetFinancialSummary } from '../../use-cases/GetFinancialSummary.js';

export default async function accountingRoutes(fastify: FastifyInstance) {
  fastify.get('/summary', { preHandler: [authenticate, requireRole(['admin', 'accountant'])] }, async () => {
    const summary = await GetFinancialSummary.execute();
    return { success: true, data: summary };
  });
}
