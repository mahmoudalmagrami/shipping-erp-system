import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeDatabase } from './config/database.js';
import { ordersRouter } from './api/routes/orders.js';
import { dispatchRouter } from './api/routes/dispatch.js';
import { pricingRouter } from './api/routes/pricing.js';
import { accountingRouter } from './api/routes/accounting.js';
import { carriersRouter } from './api/routes/carriers.js';
import { customersRouter } from './api/routes/customers.js';
import { authRouter } from './api/routes/auth.js';
import { errorHandler } from './api/middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. تهيئة قاعدة البيانات والتأكد من الجداول وبذور البيانات
initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// 2. طبقة الحماية والأمان (Security Middlewares)
app.use(helmet({
  contentSecurityPolicy: false, // للسماح بتحميل واجهة المستخدم بسلاسة مع CDN التصميم
  crossOriginResourcePolicy: { policy: 'cross-origin' },  // السماح بتحميل ملفات CSS/JS من CDNs خارجية
  crossOriginOpenerPolicy: { policy: 'unsafe-none' }       // دعم Google Fonts و Tailwind CDN
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. خدمة الملفات الثابتة للواجهة الأمامية
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

// 4. مسارات الـ APIs
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/dispatch', dispatchRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/carriers', carriersRouter);
app.use('/api/customers', customersRouter);

// فحص صحة النظام
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Shipping & Financial Posting ERP',
    timestamp: new Date().toISOString()
  });
});

// معالج الأخطاء المركزي
app.use(errorHandler);

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 نظام إدارة الشحن والترحيل المالي يعمل بنجاح!`);
  console.log(`🌐 الرابط المحلي: http://localhost:${PORT}`);
  console.log(`📡 واجهة الـ API متاحة على: http://localhost:${PORT}/api`);
  console.log(`======================================================\n`);
});
