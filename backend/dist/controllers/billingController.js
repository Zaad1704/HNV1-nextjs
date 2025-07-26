"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageStats = exports.cancelSubscription = exports.handleWebhook = exports.handlePaymentSuccess = exports.createCheckoutSession = exports.getCurrentSubscription = exports.getSubscriptionPlans = void 0;
const Subscription_1 = __importDefault(require("../models/Subscription"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Organization_1 = __importDefault(require("../models/Organization"));
const twocheckoutService_1 = __importDefault(require("../services/twocheckoutService"));
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await Plan_1.default.find({ isActive: true })
            .sort({ sortOrder: 1, price: 1 });
        res.status(200).json({
            success: true,
            data: plans
        });
    }
    catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription plans'
        });
    }
};
exports.getSubscriptionPlans = getSubscriptionPlans;
const getCurrentSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        }).populate('planId');
        const organization = await Organization_1.default.findById(req.user.organizationId);
        const countdown = await subscriptionService_1.default.getSubscriptionCountdown(req.user.organizationId);
        const statusCheck = await subscriptionService_1.default.checkSubscriptionStatus(req.user.organizationId);
        res.status(200).json({
            success: true,
            data: {
                subscription,
                organization,
                user: req.user,
                countdown,
                statusCheck
            }
        });
    }
    catch (error) {
        console.error('Get current subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription details'
        });
    }
};
exports.getCurrentSubscription = getCurrentSubscription;
const createCheckoutSession = async (req, res) => {
    try {
        const { planId } = req.body;
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const plan = await Plan_1.default.findById(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }
        const organization = await Organization_1.default.findById(req.user.organizationId);
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        const externalReference = `org_${req.user.organizationId}_plan_${planId}_${Date.now()}`;
        const buyLink = twocheckoutService_1.default.generateBuyLink({
            productId: plan.twocheckoutProductId || plan._id.toString(),
            customerEmail: req.user.email,
            customerName: req.user.name || organization.name,
            currency: plan.currency,
            returnUrl: `${process.env.FRONTEND_URL}/billing/success?ref=${externalReference}`,
            cancelUrl: `${process.env.FRONTEND_URL}/billing/cancel`,
            externalReference
        });
        const pendingSubscription = new Subscription_1.default({
            organizationId: req.user.organizationId,
            planId: plan._id,
            status: 'inactive',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + (plan.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
            amount: plan.price,
            currency: plan.currency,
            billingCycle: plan.billingCycle,
            paymentMethod: 'card',
            features: plan.features,
            limits: plan.limits,
            usage: {
                properties: 0,
                tenants: 0,
                users: 0,
                storage: 0,
                exports: 0,
                lastReset: new Date()
            }
        });
        await pendingSubscription.save();
        res.status(200).json({
            success: true,
            data: {
                checkoutUrl: buyLink,
                externalReference,
                subscriptionId: pendingSubscription._id
            }
        });
    }
    catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session'
        });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const handlePaymentSuccess = async (req, res) => {
    try {
        const { externalReference, twocheckoutOrderId } = req.body;
        if (!externalReference) {
            return res.status(400).json({
                success: false,
                message: 'External reference is required'
            });
        }
        const orgIdMatch = externalReference.match(/org_([^_]+)_/);
        if (!orgIdMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid external reference format'
            });
        }
        const organizationId = orgIdMatch[1];
        const subscription = await Subscription_1.default.findOne({
            organizationId,
            status: 'inactive'
        }).sort({ createdAt: -1 });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        subscription.status = 'active';
        subscription.twocheckoutSubscriptionId = twocheckoutOrderId;
        subscription.lastPaymentDate = new Date();
        subscription.nextBillingDate = new Date(Date.now() + (subscription.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
        await subscription.save();
        await Organization_1.default.findByIdAndUpdate(organizationId, {
            status: 'active',
            subscriptionId: subscription._id
        });
        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: subscription
        });
    }
    catch (error) {
        console.error('Handle payment success error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment success'
        });
    }
};
exports.handlePaymentSuccess = handlePaymentSuccess;
const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-2checkout-signature'];
        const ipnData = req.body;
        if (!twocheckoutService_1.default.verifyIPN(ipnData, signature)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid IPN signature'
            });
        }
        const { MESSAGE_TYPE, REFNO, IPN_PID, IPN_PNAME, ORDERSTATUS } = ipnData;
        switch (MESSAGE_TYPE) {
            case 'ORDER_CREATED':
                await handleOrderCreated(ipnData);
                break;
            case 'PAYMENT_AUTHORIZED':
                await handlePaymentAuthorized(ipnData);
                break;
            case 'PAYMENT_RECEIVED':
                await handlePaymentReceived(ipnData);
                break;
            case 'SUBSCRIPTION_CANCELED':
                await handleSubscriptionCanceled(ipnData);
                break;
            case 'SUBSCRIPTION_EXPIRED':
                await handleSubscriptionExpired(ipnData);
                break;
            default:
                console.log('Unhandled webhook event:', MESSAGE_TYPE);
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
};
exports.handleWebhook = handleWebhook;
async function handleOrderCreated(ipnData) {
    console.log('Order created:', ipnData.REFNO);
}
async function handlePaymentAuthorized(ipnData) {
    console.log('Payment authorized:', ipnData.REFNO);
}
async function handlePaymentReceived(ipnData) {
    try {
        const subscription = await Subscription_1.default.findOne({
            twocheckoutSubscriptionId: ipnData.REFNO
        });
        if (subscription) {
            subscription.status = 'active';
            subscription.lastPaymentDate = new Date();
            subscription.nextBillingDate = new Date(Date.now() + (subscription.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
            subscription.failedPaymentAttempts = 0;
            await subscription.save();
            console.log('Payment received for subscription:', subscription._id);
        }
    }
    catch (error) {
        console.error('Handle payment received error:', error);
    }
}
async function handleSubscriptionCanceled(ipnData) {
    try {
        const subscription = await Subscription_1.default.findOne({
            twocheckoutSubscriptionId: ipnData.REFNO
        });
        if (subscription) {
            subscription.status = 'canceled';
            subscription.canceledAt = new Date();
            await subscription.save();
            console.log('Subscription canceled:', subscription._id);
        }
    }
    catch (error) {
        console.error('Handle subscription canceled error:', error);
    }
}
async function handleSubscriptionExpired(ipnData) {
    try {
        const subscription = await Subscription_1.default.findOne({
            twocheckoutSubscriptionId: ipnData.REFNO
        });
        if (subscription) {
            subscription.status = 'expired';
            subscription.endedAt = new Date();
            await subscription.save();
            console.log('Subscription expired:', subscription._id);
        }
    }
    catch (error) {
        console.error('Handle subscription expired error:', error);
    }
}
const cancelSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId,
            status: 'active'
        });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Active subscription not found'
            });
        }
        if (subscription.twocheckoutSubscriptionId) {
            const result = await twocheckoutService_1.default.cancelSubscription(subscription.twocheckoutSubscriptionId);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        }
        subscription.cancelAtPeriodEnd = true;
        subscription.canceledAt = new Date();
        await subscription.save();
        res.status(200).json({
            success: true,
            message: 'Subscription will be canceled at the end of the current period',
            data: subscription
        });
    }
    catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription'
        });
    }
};
exports.cancelSubscription = cancelSubscription;
const getUsageStats = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        const Property = (await Promise.resolve().then(() => __importStar(require('../models/Property')))).default;
        const Tenant = (await Promise.resolve().then(() => __importStar(require('../models/Tenant')))).default;
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        const [propertyCount, tenantCount, userCount] = await Promise.all([
            Property.countDocuments({ organizationId: req.user.organizationId }),
            Tenant.countDocuments({ organizationId: req.user.organizationId }),
            User.countDocuments({ organizationId: req.user.organizationId })
        ]);
        subscription.usage.properties = propertyCount;
        subscription.usage.tenants = tenantCount;
        subscription.usage.users = userCount;
        await subscription.save();
        res.status(200).json({
            success: true,
            data: {
                usage: subscription.usage,
                limits: subscription.limits,
                utilizationPercentage: {
                    properties: Math.round((propertyCount / subscription.limits.properties) * 100),
                    tenants: Math.round((tenantCount / subscription.limits.tenants) * 100),
                    users: Math.round((userCount / subscription.limits.users) * 100)
                }
            }
        });
    }
    catch (error) {
        console.error('Get usage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch usage statistics'
        });
    }
};
exports.getUsageStats = getUsageStats;
