import { Router } from 'express';
import { DispatchToFinalUseCase } from '../../use-cases/DispatchToFinal.js';
import { authenticate } from '../middlewares/auth.js';

export const dispatchRouter = Router();
dispatchRouter.use(authenticate);

// ترحيل الطلب الأولي إلى طلب نهائي وإدخال بوليصة المورد وتأكيد استحقاقه المالي
dispatchRouter.post('/', (req, res, next) => {
  try {
    const result = DispatchToFinalUseCase.execute(req.body);
    res.status(200).json({
      success: true,
      message: `تم ترحيل الطلب [${result.orderNumber}] نهائياً وتسليمه لـ [${result.carrierName}] برقم بوليصة [${result.supplierWaybillNumber}]. تم قيد استحقاق المورد بالقيد المحاسبي [${result.journalEntryNumber}]`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});
