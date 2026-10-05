import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './api/middlewares/errorHandler.js';
import { runMigrations } from './db/migrate.js';
import { seed } from './db/seed.js';
import websocketPlugin from './api/plugins/websocket.js';
import authRoutes from './api/routes/auth.js';
import ordersRoutes from './api/routes/orders.js';
import dispatchRoutes from './api/routes/dispatch.js';
import pricingRoutes from './api/routes/pricing.js';
import accountingRoutes from './api/routes/accounting.js';
import carriersRoutes from './api/routes/carriers.js';
import customersRoutes from './api/routes/customers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildServer() {
  // 1. تهيئة قاعدة البيانات والبيانات الأولية
  try {
    await runMigrations();
    await seed();
  } catch (err) {
    logger.error({ err }, 'Failed to initialize database');
  }

  const fastify = Fastify({
    loggerInstance: logger,
  });

  await fastify.register(cors, {
    origin: '*',
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(rateLimit, {
    max: 150,
    timeWindow: '1 minute',
  });

  // Rate limiting specific to login: max 10 attempts per minute
  fastify.register(async (instance) => {
    await instance.register(rateLimit, {
      max: 10,
      timeWindow: '1 minute',
    });
    instance.register(authRoutes, { prefix: '/api/auth' });
  });

  await fastify.register(websocketPlugin);

  fastify.setErrorHandler(errorHandler);

  fastify.get('/api/health', async () => {
    return {
      status: 'online',
      system: 'Enterprise Shipping ERP v2.0 (Fastify + TypeScript + PostgreSQL)',
      timestamp: new Date().toISOString(),
    };
  });

  // APIs
  fastify.register(ordersRoutes, { prefix: '/api/orders' });
  fastify.register(dispatchRoutes, { prefix: '/api/dispatch' });
  fastify.register(pricingRoutes, { prefix: '/api/pricing' });
  fastify.register(accountingRoutes, { prefix: '/api/accounting' });
  fastify.register(carriersRoutes, { prefix: '/api/carriers' });
  fastify.register(customersRoutes, { prefix: '/api/customers' });

  // Serve Single Page Application (React + Vite)
  const clientDist = path.resolve(__dirname, '../client/dist');
  if (fs.existsSync(clientDist)) {
    await fastify.register(fastifyStatic, {
      root: clientDist,
      prefix: '/',
      wildcard: false,
    });

    fastify.setNotFoundHandler(async (request, reply) => {
      if (request.raw.url && request.raw.url.startsWith('/api')) {
        return reply.status(404).send({ success: false, message: 'المسار غير موجود' });
      }
      return reply.sendFile('index.html');
    });
  }

  return fastify;
}

const start = async () => {
  try {
    const server = await buildServer();
    const port = env.PORT || 3000;
    const address = await server.listen({ port, host: '0.0.0.0' });
    console.log(`\n======================================================`);
    console.log(`🚀 نظام إدارة الشحن والترحيل المالي يعمل بنجاح!`);
    console.log(`🌐 الواجهة الحديثة (React + Vite): ${address}`);
    console.log(`📡 واجهة الـ API متاحة على: ${address}/api`);
    console.log(`⚡ محرك قاعدة البيانات: PostgreSQL Engine (Type-Safe Drizzle ORM)`);
    console.log(`======================================================\n`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}
