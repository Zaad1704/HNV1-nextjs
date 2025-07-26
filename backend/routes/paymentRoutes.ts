import express from 'express';
import { requireOrganization } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Payments list endpoint - Coming soon',
      data: []
    });
  })
  .post(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Create payment endpoint - Coming soon',
      data: null
    });
  });

router.route('/:id')
  .get(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Payment details endpoint - Coming soon',
      data: null
    });
  });

export default router;