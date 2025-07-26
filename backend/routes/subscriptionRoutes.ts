import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
  getSubscriptionStatus,
  createTrialSubscription,
  activateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getAvailablePlans,
  getAllSubscriptions,
  updateSubscription
} from '../controllers/subscriptionController';

const router = Router();

// User subscription routes
router.get('/status', protect, getSubscriptionStatus);
router.post('/trial', protect, createTrialSubscription);
router.post('/activate', protect, activateSubscription);
router.post('/cancel', protect, cancelSubscription);
router.post('/reactivate', protect, reactivateSubscription);
router.get('/plans', protect, getAvailablePlans);

// Admin routes
router.get('/admin/all', protect, authorize('Super Admin'), getAllSubscriptions);
router.put('/admin/:id', protect, authorize('Super Admin'), updateSubscription);

export default router;
