import express from 'express';
import { requireOrganization } from '../middleware/auth';
import {
  getDashboardStats,
  getFinancialSummary,
  getOccupancyTrends
} from '../controllers/dashboardController';

const router = express.Router();

router.get('/stats', requireOrganization, getDashboardStats);
router.get('/financial', requireOrganization, getFinancialSummary);
router.get('/occupancy', requireOrganization, getOccupancyTrends);

export default router;