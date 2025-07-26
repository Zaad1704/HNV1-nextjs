import express from 'express';
import { requireOrganization } from '../middleware/auth';

const router = express.Router();

router.get('/', requireOrganization, async (req, res) => {
  res.json({
    success: true,
    message: 'Analytics endpoint - Coming soon',
    data: []
  });
});

export default router;