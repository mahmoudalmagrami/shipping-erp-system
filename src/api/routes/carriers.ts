import type { FastifyInstance } from 'fastify';
import { authenticate } from '../middlewares/auth.js';
import { CarrierRepository } from '../../repositories/CarrierRepository.js';

export default async function carriersRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: [authenticate] }, async () => {
    const carriers = await CarrierRepository.getAll();
    return { success: true, count: carriers.length, data: carriers };
  });
}
