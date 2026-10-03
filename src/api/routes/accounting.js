import { Router } from 'express';
import { GetFinancialSummaryUseCase } from '../../use-cases/GetFinancialSummary.js';
import { authenticate } from '../middlewares/auth.js';

export const accountingRouter = Router();
accountingRouter.use(authenticate);

// استعلام كشف الحساب والملخص المالي اللحظي والقيود المحاسبية
accountingRouter.get('/summary', (req, res, next) => {
  try {
    const summary = GetFinancialSummaryUseCase.execute();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});
