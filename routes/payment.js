// routes/plan.js
import express from 'express';
import {
  createOrder,
  verifyPayment,
  purchasePlan
} from '../controllers/payment.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/order',authMiddleware,  createOrder);
router.post('/verify',authMiddleware, verifyPayment);
router.post('/buy', authMiddleware, purchasePlan);

export default router;
