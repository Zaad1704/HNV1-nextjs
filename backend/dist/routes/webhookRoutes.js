"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const router = (0, express_1.Router)();
router.post('/2checkout', (req, res) => {
    try {
        console.log('2Checkout webhook received:', req.body);
        const { event_type, order } = req.body;
        if (event_type === 'ORDER_CREATED' || event_type === 'PAYMENT_AUTHORIZED') {
            console.log('Payment successful:', order);
        }
        res.status(200).json({ success: true, message: 'Webhook processed' });
    }
    catch (error) {
        console.error('2Checkout webhook error:', error);
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});
router.post('/stripe', webhookController_1.handleStripeWebhook);
exports.default = router;
