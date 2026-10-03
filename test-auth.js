import assert from 'node:assert';
import { initializeDatabase } from './src/config/database.js';
import { AuthService } from './src/domain/services/AuthService.js';

console.log('🧪 بدء اختبار نظام المصادقة والصلاحيات (Auth & RBAC)...');

// 1. Initialize
initializeDatabase();

// 2. Test Admin Login
const adminLogin = AuthService.login('admin', 'admin123');
assert.ok(adminLogin.token, 'Token must be generated');
assert.strictEqual(adminLogin.user.username, 'admin');
assert.strictEqual(adminLogin.user.role, 'admin');
console.log('✅ تسجيل دخول المدير العام (admin) نجح وتولد الرمز المشفر.');

// 3. Test Cashier Login
const cashierLogin = AuthService.login('cashier', 'cashier123');
assert.strictEqual(cashierLogin.user.role, 'cashier');
console.log('✅ تسجيل دخول موظف الاستقبال (cashier) نجح بدقة.');

// 4. Test Token Verification
const verified = AuthService.verifyToken(adminLogin.token);
assert.ok(verified, 'Token must be valid');
assert.strictEqual(verified.username, 'admin');
assert.strictEqual(verified.role, 'admin');
console.log('✅ التحقق من التوقيع الرقمي للرمز (Signature verification) يعمل بدقة.');

// 5. Test Invalid Password
assert.throws(() => {
  AuthService.login('admin', 'wrong_password');
}, /غير صحيحة/);
console.log('✅ حماية كلمات المرور الخاطئة تعمل بصلابة.');

console.log('\n🎉🎉 كافة فحوصات نظام المصادقة نجحت بنسبة 100%! 🎉🎉\n');
