import express from 'express';
import { requireOrganization } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Tenants list endpoint - Coming soon',
      data: []
    });
  })
  .post(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Create tenant endpoint - Coming soon',
      data: null
    });
  });

router.route('/:id')
  .get(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Tenant details endpoint - Coming soon',
      data: null
    });
  })
  .put(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Update tenant endpoint - Coming soon',
      data: null
    });
  })
  .delete(requireOrganization, async (req, res) => {
    res.json({
      success: true,
      message: 'Delete tenant endpoint - Coming soon',
      data: null
    });
  });

export default router;