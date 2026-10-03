import { Router } from 'express';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { CalculateRateUseCase } from '../../use-cases/CalculateRate.js';
import { authenticate } from '../middlewares/auth.js';

export const pricingRouter = Router();
pricingRouter.use(authenticate);

// 1. جلب كافة الوجهات وشرائح أسعارها
pricingRouter.get('/zones', (req, res, next) => {
  try {
    const zonesWithTiers = OrderRepository.getZonesWithTiers();
    res.json({ success: true, data: zonesWithTiers });
  } catch (err) {
    next(err);
  }
});

// 2. حاسبة تسعير فورية للوزن والأبعاد والوجهة
pricingRouter.post('/calculate', (req, res, next) => {
  try {
    const result = CalculateRateUseCase.execute(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});
