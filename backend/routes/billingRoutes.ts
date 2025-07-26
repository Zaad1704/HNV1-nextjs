import express from 'express';
import { 
  getSubscriptionPlans,
  getCurrentSubscription,
  createCheckoutSession,
  handlePaymentSuccess,
  handleWebhook,
  cancelSubscription,
  getUsageStats
} from '../controllers/billingController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);
router.post('/webhook', handleWebhook); // 2Checkout webhook

// Protected routes
router.use(protect);

router.get('/subscription', getCurrentSubscription);
router.post('/create-checkout', createCheckoutSession);
router.post('/payment-success', handlePaymentSuccess);
router.post('/cancel', cancelSubscription);
router.get('/usage', getUsageStats);

export default router;