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
exports.getDashboardStats = exports.getStats = exports.getRentStatus = exports.getFinancialSummary = exports.getExpiringLeases = exports.getLateTenants = exports.getOverviewStats = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Expense_1 = __importDefault(require("../models/Expense"));
const dashboardService_1 = __importDefault(require("../services/dashboardService"));
const safeAsync = (fn) => {
    return async (req, res) => {
        try {
            await fn(req, res);
        }
        catch (error) {
            console.error('Dashboard controller error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Dashboard data temporarily unavailable',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }
    };
};
exports.getOverviewStats = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(200).json({
            success: true,
            data: { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: 0 }
        });
    }
    const organizationId = req.user.organizationId;
    const [propertiesResult, tenantsResult, revenueResult] = await Promise.allSettled([
        Property_1.default.countDocuments({ organizationId }).exec(),
        Tenant_1.default.countDocuments({ organizationId, status: { $in: ['Active', 'Late'] } }).exec(),
        Payment_1.default.aggregate([
            { $match: { organizationId, status: { $in: ['Paid', 'completed', 'Completed'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).exec()
    ]);
    const totalProperties = propertiesResult.status === 'fulfilled' ? propertiesResult.value || 0 : 0;
    const activeTenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value || 0 : 0;
    const monthlyRevenue = revenueResult.status === 'fulfilled' ?
        (revenueResult.value?.[0]?.total || 0) : 0;
    const occupancyRate = totalProperties > 0 ? Math.round((activeTenants / totalProperties) * 100) : 0;
    res.status(200).json({
        success: true,
        data: {
            totalProperties,
            activeTenants,
            monthlyRevenue,
            occupancyRate
        }
    });
});
exports.getLateTenants = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(200).json({ success: true, data: [] });
    }
    const lateTenants = await Tenant_1.default.find({
        organizationId: req.user.organizationId,
        status: { $in: ['Late', 'Overdue'] }
    })
        .select('name email phone unit status lastPaymentDate')
        .limit(5)
        .lean()
        .exec() || [];
    res.status(200).json({ success: true, data: lateTenants });
});
exports.getExpiringLeases = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(200).json({ success: true, data: [] });
    }
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    const expiringLeases = await Tenant_1.default.find({
        organizationId: req.user.organizationId,
        leaseEndDate: { $gte: today, $lte: threeMonthsFromNow },
        status: 'Active'
    }).limit(5) || [];
    res.status(200).json({ success: true, data: expiringLeases });
});
exports.getFinancialSummary = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(200).json({ success: true, data: [] });
    }
    const organizationId = req.user.organizationId;
    const promises = [];
    for (let i = 0; i < 6; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - (5 - i));
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
        promises.push(Promise.allSettled([
            Payment_1.default.aggregate([
                { $match: { organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd }, status: { $in: ['Paid', 'completed', 'Completed'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).exec(),
            Expense_1.default.aggregate([
                { $match: { organizationId, date: { $gte: monthStart, $lte: monthEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).exec()
        ]).then(([revenueResult, expenseResult]) => ({
            name: monthName,
            Revenue: revenueResult.status === 'fulfilled' ? (revenueResult.value?.[0]?.total || 0) : 0,
            Expenses: expenseResult.status === 'fulfilled' ? (expenseResult.value?.[0]?.total || 0) : 0
        })));
    }
    const results = await Promise.allSettled(promises);
    const financialData = results.map(result => result.status === 'fulfilled' ? result.value : { name: 'N/A', Revenue: 0, Expenses: 0 });
    res.status(200).json({ success: true, data: financialData });
});
exports.getRentStatus = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(200).json({ success: true, data: [] });
    }
    const activeCount = await Tenant_1.default.countDocuments({ organizationId: req.user.organizationId, status: 'Active' }) || 0;
    const lateCount = await Tenant_1.default.countDocuments({ organizationId: req.user.organizationId, status: 'Late' }) || 0;
    const archivedCount = await Tenant_1.default.countDocuments({ organizationId: req.user.organizationId, status: 'Archived' }) || 0;
    const data = [
        { name: 'Paid / Current', value: activeCount },
        { name: 'Overdue', value: lateCount },
        { name: 'Archived', value: archivedCount }
    ];
    res.status(200).json({ success: true, data });
});
exports.getStats = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        console.log('User has no organization, creating one:', req.user?.email);
        try {
            const Organization = (await Promise.resolve().then(() => __importStar(require('../models/Organization')))).default;
            const Plan = (await Promise.resolve().then(() => __importStar(require('../models/Plan')))).default;
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            const organization = new Organization({
                name: `${req.user.name}'s Organization`,
                owner: req.user._id,
                members: [req.user._id],
                status: 'active'
            });
            await organization.save();
            const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
            await User.findByIdAndUpdate(req.user._id, {
                organizationId: organization._id,
                status: 'active'
            });
            try {
                const trialPlan = await Plan.findOne({ name: 'Free Trial' });
                await subscriptionService.createTrialSubscription(organization._id.toString(), trialPlan?._id?.toString() || 'default-plan');
                console.log('✅ Trial subscription created for user:', req.user.email);
            }
            catch (error) {
                console.error('❌ Failed to create trial subscription:', error);
            }
            req.user.organizationId = organization._id;
            console.log('✅ Organization created for user:', req.user.email);
        }
        catch (error) {
            console.error('❌ Failed to create organization:', error);
            return res.status(200).json({
                success: true,
                data: {
                    totalProperties: 0,
                    totalTenants: 0,
                    monthlyRevenue: 0,
                    occupancyRate: 0,
                    pendingMaintenance: 0,
                    recentPayments: 0
                },
                message: 'Organization setup in progress - showing empty dashboard'
            });
        }
    }
    console.log('Fetching stats for organization:', req.user.organizationId);
    const stats = await dashboardService_1.default.getDashboardStats(req.user.organizationId, req.user.role, req.user._id);
    console.log('Dashboard stats result:', stats);
    res.status(200).json({ success: true, data: stats });
});
exports.getDashboardStats = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        console.log('User has no organization for dashboard stats:', req.user?.email);
        return res.status(200).json({
            success: true,
            data: {
                totalProperties: 0,
                totalTenants: 0,
                monthlyRevenue: 0,
                occupancyRate: 0,
                pendingMaintenance: 0,
                recentPayments: 0
            },
            message: 'No organization found - showing empty dashboard'
        });
    }
    console.log('Fetching dashboard stats for organization:', req.user.organizationId);
    const stats = await dashboardService_1.default.getDashboardStats(req.user.organizationId, req.user.role, req.user._id);
    console.log('Dashboard stats result:', stats);
    res.status(200).json({ success: true, data: stats });
});
