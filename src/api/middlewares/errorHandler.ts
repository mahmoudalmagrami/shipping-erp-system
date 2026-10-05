import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../domain/errors/index.js';
import { logger } from '../../config/logger.js';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  logger.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      errorType: error.errorType,
      message: error.message,
    });
  }

  if (error instanceof z.ZodError) {
    const errorMessages = error.errors.map((e) => e.message).join(' | ');
    return reply.status(400).send({
      success: false,
      errorType: 'ValidationError',
      message: errorMessages,
      details: error.errors,
    });
  }

  return reply.status(500).send({
    success: false,
    errorType: 'InternalServerError',
    message: 'حدث خطأ داخلي في الخادم أثناء معالجة الطلب',
  });
}
