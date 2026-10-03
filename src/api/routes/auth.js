import { Router } from 'express';
import { AuthService } from '../../domain/services/AuthService.js';
import { authenticate } from '../middlewares/auth.js';

export const authRouter = Router();

// 1. تسجيل الدخول
authRouter.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = AuthService.login(username, password);
    res.json({
      success: true,
      message: `مرحباً بك يا ${result.user.fullName}، تم تسجيل الدخول بنجاح`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// 2. التحقق من المستخدم الحالي
authRouter.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// 3. استعراض قائمة الأدوار المتاحة وشرح صلاحياتها
authRouter.get('/roles', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        role: 'admin',
        titleAr: 'المدير العام (Administrator)',
        titleEn: 'General Administrator',
        descriptionAr: 'صلاحيات كاملة وغير مقيدة: رؤية الأرباح، الـ KPIs، القيود، الترحيل، والحجز.'
      },
      {
        role: 'cashier',
        titleAr: 'موظف الاستقبال / كاشير (Cashier)',
        titleEn: 'Reception Cashier',
        descriptionAr: 'حجز الطلب الأولي فقط، قبض الأموال بالصندوق أو البنك، ولا يرى أرباح الشركة ولا تكاليف الموردين.'
      },
      {
        role: 'warehouse',
        titleAr: 'مسؤول المستودع والترحيل (Warehouse Dispatcher)',
        titleEn: 'Warehouse Dispatcher',
        descriptionAr: 'استلام الطرود المعلقة، تسليمها لشركات الشحن، وإدخال رقم بوليصة المورد وتكلفته.'
      },
      {
        role: 'accountant',
        titleAr: 'المحاسب المالي (Chief Accountant)',
        titleEn: 'Chief Accountant',
        descriptionAr: 'الاطلاع على دفتر الأستاذ العام، سندات وحركات الصناديق، ميزان المراجعة، ومستحقات الموردين.'
      }
    ]
  });
});
