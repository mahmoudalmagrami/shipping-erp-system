import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../domain/services/AuthService.js';
import { AuthenticationError, AuthorizationError } from '../../domain/errors/index.js';
import type { UserRole, TokenPayload } from '../../domain/types/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authenticate(request: FastifyRequest, _reply?: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('لم يتم توفير رمز مميز للدخول');
  }

  const token = authHeader.split(' ')[1];
  const payload = await AuthService.verifyToken(token);

  if (!payload) {
    throw new AuthenticationError('رمز الدخول غير صالح أو منتهي الصلاحية');
  }

  request.user = payload;
}

export function requireRole(roles: UserRole[]) {
  return async (request: FastifyRequest, _reply?: FastifyReply) => {
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw new AuthorizationError(`ليس لديك صلاحية للقيام بهذا الإجراء (${roles.join(', ')})`);
    }
  };
}

export async function optionalAuth(request: FastifyRequest, _reply?: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = await AuthService.verifyToken(token);
    if (payload) {
      request.user = payload;
    }
  }
}
