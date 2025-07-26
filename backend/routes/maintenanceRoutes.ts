import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize as rbac } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  searchMaintenanceRequests,
  getMaintenanceSummary,
  bulkMaintenanceActions
} from '../controllers/maintenanceController';

const router = Router();

// Apply authentication to all routes
router.use(protect);

// Search and summary routes (before parameterized routes)
router.get('/search', searchMaintenanceRequests);
router.get('/summary', getMaintenanceSummary);

// Bulk operations
router.post('/bulk-actions', rbac('Admin', 'Manager'), bulkMaintenanceActions);

// Main CRUD routes
router.route('/')
  .get(getMaintenanceRequests)
  .post(
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'attachments', maxCount: 3 }
    ]),
    rbac('Admin', 'Manager', 'Agent', 'Tenant'), 
    createMaintenanceRequest
  );

router.route('/:id')
  .get(getMaintenanceRequestById)
  .put(
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'attachments', maxCount: 3 }
    ]),
    rbac('Admin', 'Manager', 'Agent'),
    updateMaintenanceRequest
  )
  .delete(rbac('Admin', 'Manager'), deleteMaintenanceRequest);

// Error handling middleware
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Maintenance route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((err: any) => err.message)
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
