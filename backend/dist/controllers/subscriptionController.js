"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscription = exports.getAllSubscriptions = exports.getAvailablePlans = exports.reactivateSubscription = exports.cancelSubscription = exports.activateSubscription = exports.createTrialSubscription = exports.getSubscriptionStatus = void 0;
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const Plan_1 = __importDefault(require("../models/Plan"));
const getSubscriptionStatus = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(200).json({
                success: true,
                data: { hasSubscription: false, status: null }
            });
        }
        const status = await subscriptionService_1.default.getSubscriptionStatus(req.user.organizationId);
        res.json({ success: true, data: status });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getSubscriptionStatus = getSubscriptionStatus;
const createTrialSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({ success: false, message: 'Organization required' });
        }
        const { planId } = req.body;
        const subscription = await subscriptionService_1.default.createTrialSubscription(req.user.organizationId, planId);
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createTrialSubscription = createTrialSubscription;
const activateSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({ success: false, message: 'Organization required' });
        }
        const { planId } = req.body;
        const existingSubscription = await Subscription_1.default.findOne({ organizationId: req.user.organizationId });
        const subscription = await subscriptionService_1.default.activateSubscription(existingSubscription?._id?.toString() || '');
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.activateSubscription = activateSubscription;
const cancelSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({ success: false, message: 'Organization required' });
        }
        const existingSubscription = await Subscription_1.default.findOne({ organizationId: req.user.organizationId });
        const subscription = await subscriptionService_1.default.cancelSubscription(existingSubscription?._id?.toString() || '');
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.cancelSubscription = cancelSubscription;
const reactivateSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({ success: false, message: 'Organization required' });
        }
        const existingSubscription = await Subscription_1.default.findOne({ organizationId: req.user.organizationId });
        const subscription = await subscriptionService_1.default.reactivateSubscription(existingSubscription?._id?.toString() || '');
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.reactivateSubscription = reactivateSubscription;
const getAvailablePlans = async (req, res) => {
    try {
        const plans = await Plan_1.default.find({ isActive: true, isPublic: true }).sort({ price: 1 });
        res.json({ success: true, data: plans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAvailablePlans = getAvailablePlans;
const getAllSubscriptions = async (req, res) => {
    try {
        if (req.user?.role !== 'Super Admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const subscriptions = await Subscription_1.default.find({})
            .populate('organizationId', 'name owner')
            .populate('planId', 'name price')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: subscriptions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
const updateSubscription = async (req, res) => {
    try {
        if (req.user?.role !== 'Super Admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { id } = req.params;
        const updates = req.body;
        const subscription = await Subscription_1.default.findByIdAndUpdate(id, updates, { new: true })
            .populate('organizationId', 'name')
            .populate('planId', 'name price');
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateSubscription = updateSubscription;
