import crypto from 'node:crypto';
import { db } from '../../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shipping_erp_secret_key_2026_super_secure';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export class AuthService {
  /**
   * تشفير كلمة المرور باستخدام خوارزمية scrypt المقاومة للهجمات
   * @param {string} password 
   * @param {string} salt 
   */
  static hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { hash, salt };
  }

  /**
   * مطابقة كلمة المرور مع الحماية من التوقيت الحرج (Timing-Safe)
   * @param {string} password 
   * @param {string} hash 
   * @param {string} salt 
   */
  static verifyPassword(password, hash, salt) {
    const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const verifyBuf = Buffer.from(verifyHash, 'hex');
    if (hashBuf.length !== verifyBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, verifyBuf);
  }

  /**
   * توليد رمز دخول مشفر وموقع رقمياً (Cryptographically Signed Token)
   * @param {Object} user 
   */
  static generateToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      exp: Date.now() + TOKEN_EXPIRY_MS
    };

    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadB64)
      .digest('base64url');

    return `${payloadB64}.${signature}`;
  }

  /**
   * التحقق من سلامة وصلاحية الرمز المشفر
   * @param {string} token 
   */
  static verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadB64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'base64url');
    const expectedBuf = Buffer.from(expectedSignature, 'base64url');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    try {
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
      if (Date.now() > payload.exp) return null; // منتهي الصلاحية
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * التحقق من بيانات الدخول
   * @param {string} username 
   * @param {string} password 
   */
  static login(username, password) {
    if (!username || !password) {
      throw new Error('اسم المستخدم وكلمة المرور مطلوبان');
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username.trim().toLowerCase());
    if (!user) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const isValid = this.verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role
      }
    };
  }

  /**
   * جلب بيانات المستخدم بالمعرف
   * @param {number} userId 
   */
  static getUserById(userId) {
    const user = db.prepare('SELECT id, username, full_name, role, is_active, created_at FROM users WHERE id = ?').get(userId);
    return user || null;
  }
}
