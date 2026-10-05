import { describe, it, expect } from 'vitest';
import { AuthService } from './AuthService.js';

describe('AuthService', () => {
  it('should hash password and verify accurately with timing-safe comparison', () => {
    const pwd = 'securePassword123!';
    const { hash, salt } = AuthService.hashPassword(pwd);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();

    const isValid = AuthService.verifyPassword(pwd, hash, salt);
    expect(isValid).toBe(true);

    const isInvalid = AuthService.verifyPassword('wrongPassword', hash, salt);
    expect(isInvalid).toBe(false);
  });

  it('should generate a standard signed JWT and verify it with jose', async () => {
    const user = {
      id: 1,
      username: 'admin',
      role: 'admin' as const,
      fullName: 'مدير النظام',
    };

    const token = await AuthService.generateToken(user);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // Header.Payload.Signature

    const verified = await AuthService.verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(1);
    expect(verified?.username).toBe('admin');
    expect(verified?.role).toBe('admin');
  });

  it('should reject invalid or tampered tokens', async () => {
    const verified = await AuthService.verifyToken('invalid.token.here');
    expect(verified).toBeNull();
  });
});
