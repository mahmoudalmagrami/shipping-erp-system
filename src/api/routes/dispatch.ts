import type { FastifyInstance } from 'fastify';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { DispatchToFinal } from '../../use-cases/DispatchToFinal.js';

export default async function dispatchRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [authenticate, requireRole(['admin', 'warehouse'])] }, async (request) => {
    const result = await DispatchToFinal.execute(request.body);
    fastify.broadcastUpdate('order_dispatched', result);
    return {
      success: true,
      message: `تم ترحيل الطلب [${result.orderNumber}] نهائياً وتسليمه لـ [${result.carrierName}] برقم بوليصة [${result.supplierWaybillNumber}]`,
      data: result
    };
  });
}
