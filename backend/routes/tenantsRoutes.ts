import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { cascadeTenantChanges } from '../middleware/cascadeMiddleware';
import { authorize as rbac } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantDataPreviews,
  getTenantStats,
  getTenantAnalytics,
  archiveTenant,
  downloadTenantPDF,
  downloadTenantDataZip,
  downloadPersonalDetailsPDF,
  searchTenants,
  getTenantSummary,
  bulkTenantActions,
  restoreTenant
} from '../controllers/tenantsController';

const router = Router();

// Apply authentication to all routes
router.use(protect);

// Search and summary routes (before parameterized routes)
router.get('/search', searchTenants);
router.get('/summary', getTenantSummary);

// Bulk operations
router.post('/bulk-actions', rbac('Admin', 'Manager'), bulkTenantActions);

// Main CRUD routes
router.route('/')
  .get(getTenants)
  .post(
    upload.fields([
      { name: 'tenantImage', maxCount: 1 },
      { name: 'govtIdFront', maxCount: 1 },
      { name: 'govtIdBack', maxCount: 1 },
      { name: 'additionalAdultImage_0', maxCount: 1 },
      { name: 'additionalAdultImage_1', maxCount: 1 },
      { name: 'additionalAdultImage_2', maxCount: 1 },
      { name: 'additionalAdultGovtId_0', maxCount: 1 },
      { name: 'additionalAdultGovtId_1', maxCount: 1 },
      { name: 'additionalAdultGovtId_2', maxCount: 1 }
    ]), 
    rbac('Admin', 'Manager', 'Agent'), 
    createTenant
  );

router.route('/:id')
  .get(getTenantById)
  .put(
    upload.fields([
      { name: 'tenantImage', maxCount: 1 },
      { name: 'govtIdFront', maxCount: 1 },
      { name: 'govtIdBack', maxCount: 1 },
      { name: 'additionalAdultImage_0', maxCount: 1 },
      { name: 'additionalAdultImage_1', maxCount: 1 },
      { name: 'additionalAdultImage_2', maxCount: 1 },
      { name: 'additionalAdultGovtId_0', maxCount: 1 },
      { name: 'additionalAdultGovtId_1', maxCount: 1 },
      { name: 'additionalAdultGovtId_2', maxCount: 1 }
    ]),
    rbac('Admin', 'Manager', 'Agent'),
    updateTenant
  )
  .delete(rbac('Admin', 'Manager'), async (req: any, res) => {
    try {
      await cascadeTenantChanges(req.params.id, 'delete', req.user.organizationId);
      deleteTenant(req, res);
    } catch (error) {
      console.error('Cascade tenant deletion error:', error);
      res.status(500).json({ success: false, message: 'Failed to cascade tenant deletion' });
    }
  });

// Tenant management routes
router.patch('/:id/archive', rbac('Admin', 'Manager'), archiveTenant);
router.patch('/:id/restore', rbac('Admin', 'Manager'), restoreTenant);

// Data and analytics routes
router.get('/:tenantId/data-previews', getTenantDataPreviews);
router.get('/:tenantId/stats', getTenantStats);
router.get('/:tenantId/analytics', getTenantAnalytics);

// PDF and export routes
router.post('/:id/download-pdf', downloadTenantPDF);
router.post('/:id/personal-details-pdf', downloadPersonalDetailsPDF);
router.post('/:id/download-zip', downloadTenantDataZip);

// Error handling middleware for tenant routes
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Tenant route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((err: any) => err.message)
    });
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    let message = 'Duplicate entry detected';
    
    if (field === 'email') {
      message = 'A tenant with this email already exists';
    } else if (field.includes('propertyId') && field.includes('unit')) {
      message = 'This unit is already occupied';
    }
    
    return res.status(400).json({
      success: false,
      message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;
