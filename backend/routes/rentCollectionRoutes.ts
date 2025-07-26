import { Router } from 'express';
import {
  getAnalytics,
  getOverdue,
  getPeriod,
  generatePeriod,
  getActions,
  createAction,
  createSheet
} from '../controllers/rentCollectionController';

const router = Router();

router.get('/analytics', getAnalytics);
router.get('/overdue', getOverdue);
router.get('/period/:year/:month', getPeriod);
router.post('/period/:year/:month/generate', generatePeriod);
router.get('/actions', getActions);
router.post('/action', createAction);
router.post('/sheet/:id/create', createSheet);

export default router;
