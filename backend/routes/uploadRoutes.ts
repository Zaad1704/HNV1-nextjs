import express from 'express';
import { requireOrganization } from '../middleware/auth';

const router = express.Router();

router.post('/', requireOrganization, async (req, res) => {
  res.json({
    success: true,
    message: 'File upload endpoint - Coming soon',
    data: null
  });
});

export default router;