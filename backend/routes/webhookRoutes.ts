import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

// 2Checkout webhook endpoint
router.post('/2checkout', (req, res) => {
  try {
    console.log('2Checkout webhook received:', req.body);
    
    const { event_type, order } = req.body;
    
    if (event_type === 'ORDER_CREATED' || event_type === 'PAYMENT_AUTHORIZED') {
      console.log('Payment successful:', order);
      // Handle successful payment
    }
    
    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('2Checkout webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

router.post('/stripe', handleStripeWebhook);

export default router;