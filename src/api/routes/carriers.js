import { Router } from 'express';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { authenticate } from '../middlewares/auth.js';

export const carriersRouter = Router();
carriersRouter.use(authenticate);

carriersRouter.get('/', (req, res, next) => {
  try {
    const carriers = OrderRepository.getCarriers();
    res.json({ success: true, count: carriers.length, data: carriers });
  } catch (err) {
    next(err);
  }
});
