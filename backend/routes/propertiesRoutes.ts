import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertyDataPreviews,
  getUnitData,
  validateDataIntegrity,
  regenerateDescription,
  getPropertyUnits,
  restoreProperty,
  bulkUpdateProperties,
  getPropertyAnalytics,
  searchProperties,
  getPropertySummary
} from '../controllers/propertyController';
import { getVacantUnits } from '../controllers/unitController';
import { protect } from '../middleware/authMiddleware';
import { cascadePropertyChanges } from '../middleware/cascadeMiddleware';
import { authorize as rbac } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';
import { IUser } from '../models/User';

const router = Router();

// Apply authentication to all routes
router.use(protect);

// Search and summary routes (before parameterized routes)
router.get('/search', searchProperties);
router.get('/summary', getPropertySummary);
router.get('/validate/data-integrity', validateDataIntegrity);

// Bulk operations
router.patch('/bulk-update', rbac('Admin', 'Manager'), bulkUpdateProperties);

// Main CRUD routes
router.route('/')
  .get(getProperties)
  .post(upload.single('image'), rbac('Admin', 'Manager'), createProperty);

router.route('/:id')
  .get(getPropertyById)
  .put(upload.single('image'), rbac('Admin', 'Manager', 'Agent'), updateProperty)
  .delete(rbac('Admin', 'Manager'), async (req: any, res) => {
    try {
      await cascadePropertyChanges(req.params.id, 'delete', (req.user as IUser)?.organizationId?.toString());
      deleteProperty(req, res);
    } catch (error) {
      console.error('Cascade property deletion error:', error);
      res.status(500).json({ success: false, message: 'Failed to cascade property deletion' });
    }
  });

// Property management routes
router.patch('/:id/archive', rbac('Admin', 'Manager'), async (req: any, res) => {
  try {
    await cascadePropertyChanges(req.params.id, 'archive', (req.user as IUser)?.organizationId?.toString());
    deleteProperty(req, res); // Uses the updated deleteProperty which archives
  } catch (error) {
    console.error('Archive property error:', error);
    res.status(500).json({ success: false, message: 'Failed to archive property' });
  }
});

router.patch('/:id/restore', rbac('Admin', 'Manager'), restoreProperty);
router.put('/:id/regenerate-description', rbac('Admin', 'Manager', 'Agent'), regenerateDescription);

// Property data and analytics routes
router.get('/:propertyId/analytics', getPropertyAnalytics);
router.get('/:propertyId/data-previews', getPropertyDataPreviews);
router.get('/:propertyId/units', getPropertyUnits);
router.get('/:propertyId/units/:unitNumber/data', getUnitData);
router.get('/:propertyId/vacant-units', getVacantUnits);

// Error handling middleware for property routes
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Property route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((err: any) => err.message)
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry detected'
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