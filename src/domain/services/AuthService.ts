import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { AuthenticationError } from '../errors/index.js';
import type { TokenPayload, UserRole } from '../types/index.js';

export class AuthService {
  static secret = new TextEncoder().encode(env.JWT_SECRET);

  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const finalSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, finalSalt, 64).toString('hex');
    return { hash, salt: finalSalt };
  }

  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
    } catch {
      return false;
    }
  }

  static async generateToken(user: { id: number; username: string; role: string; fullName: string | null }): Promise<string> {
    return new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role as UserRole,
      fullName: user.fullName || '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${env.JWT_EXPIRY_HOURS}h`)
      .sign(AuthService.secret);
  }

  static async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, AuthService.secret);
      return payload as unknown as TokenPayload;
    } catch {
      return null;
    }
  }

  static async login(username: string, password: string) {
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      throw new AuthenticationError('بيانات الدخول غير صحيحة');
    }

    const isValid = AuthService.verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      throw new AuthenticationError('بيانات الدخول غير صحيحة');
    }

    const token = await AuthService.generateToken(user as any);
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }

  static async getUserById(userId: number) {
    return UserRepository.findById(userId);
  }
}
