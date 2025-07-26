"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const billingController_1 = require("../controllers/billingController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/plans', billingController_1.getSubscriptionPlans);
router.post('/webhook', billingController_1.handleWebhook);
router.use(auth_1.protect);
router.get('/subscription', billingController_1.getCurrentSubscription);
router.post('/create-checkout', billingController_1.createCheckoutSession);
router.post('/payment-success', billingController_1.handlePaymentSuccess);
router.post('/cancel', billingController_1.cancelSubscription);
router.get('/usage', billingController_1.getUsageStats);
exports.default = router;
