import express from 'express';
import { requireOrganization } from '../middleware/auth';

const router = express.Router();

router.get('/stats', requireOrganization, async (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard stats endpoint - Coming soon',
    data: {
      totalProperties: 0,
      totalTenants: 0,
      totalRevenue: 0,
      occupancyRate: 0
    }
  });
});

export default router;