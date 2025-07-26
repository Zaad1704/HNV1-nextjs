import express from 'express';

const router = express.Router();

router.post('/stripe', async (req, res) => {
  res.json({
    success: true,
    message: 'Stripe webhook endpoint - Coming soon'
  });
});

router.post('/twocheckout', async (req, res) => {
  res.json({
    success: true,
    message: '2Checkout webhook endpoint - Coming soon'
  });
});

export default router;