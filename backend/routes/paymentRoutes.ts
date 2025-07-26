import express from 'express';
import { requireOrganization } from '../middleware/auth';
import { getPayments, createPayment, updatePayment } from '../controllers/paymentController-real';

const router = express.Router();

router.route('/')
  .get(requireOrganization, getPayments)
  .post(requireOrganization, createPayment);

router.route('/:id')
  .put(requireOrganization, updatePayment);

export default router;