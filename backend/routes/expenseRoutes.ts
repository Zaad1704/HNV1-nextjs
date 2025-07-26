import express from 'express';
import { requireOrganization } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Expenses list endpoint - Coming soon',
      data: []
    });
  })
  .post(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Create expense endpoint - Coming soon',
      data: null
    });
  });

export default router;