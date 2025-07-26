"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const Subscription_1 = __importDefault(require("../models/Subscription"));
const handleStripeWebhook = async (req, res) => {
    try {
        const { type, data } = req.body;
        switch (type) {
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCanceled(data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(data.object);
                break;
            default:
                console.log(`Unhandled webhook event: ${type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook error' });
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
const handlePaymentSucceeded = async (invoice) => {
    try {
        const subscription = await Subscription_1.default.findOne({
            externalId: invoice.subscription
        });
        if (subscription) {
            subscription.status = 'active';
            const nextPeriod = new Date(invoice.period_end * 1000);
            subscription.currentPeriodEndsAt = nextPeriod;
            await subscription.save();
        }
    }
    catch (error) {
        console.error('Error handling payment succeeded:', error);
    }
};
const handlePaymentFailed = async (invoice) => {
    try {
        const subscription = await Subscription_1.default.findOne({
            externalId: invoice.subscription
        });
        if (subscription) {
            subscription.status = 'past_due';
            await subscription.save();
        }
    }
    catch (error) {
        console.error('Error handling payment failed:', error);
    }
};
const handleSubscriptionCanceled = async (subscription) => {
    try {
        const sub = await Subscription_1.default.findOne({
            externalId: subscription.id
        });
        if (sub) {
            sub.status = 'canceled';
            await sub.save();
        }
    }
    catch (error) {
        console.error('Error handling subscription canceled:', error);
    }
};
const handleSubscriptionUpdated = async (subscription) => {
    try {
        const sub = await Subscription_1.default.findOne({
            externalId: subscription.id
        });
        if (sub) {
            sub.status = subscription.status === 'active' ? 'active' : 'inactive';
            sub.currentPeriodEndsAt = new Date(subscription.current_period_end * 1000);
            await sub.save();
        }
    }
    catch (error) {
        console.error('Error handling subscription updated:', error);
    }
};
