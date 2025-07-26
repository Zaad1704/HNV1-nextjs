import express from 'express';
const router = express.Router();

// 2Checkout webhook endpoint
router.post('/2checkout', (req, res) => {
  try {
    console.log('2Checkout webhook received:', req.body);
    
    // Basic webhook validation
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

// Stripe webhook endpoint (for future use)
router.post('/stripe', (req, res) => {
  try {
    console.log('Stripe webhook received:', req.body);
    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

export default router;