import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createCashFlowRecord,
  getCashFlowRecords,
  updateCashFlowRecord,
  deleteCashFlowRecord
} from '../controllers/cashFlowController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getCashFlowRecords)
  .post(createCashFlowRecord);

router.route('/:id')
  .put(updateCashFlowRecord)
  .delete(deleteCashFlowRecord);

export default router;
