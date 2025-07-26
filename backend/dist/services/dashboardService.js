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
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Reminder_1 = __importDefault(require("../models/Reminder"));
class DashboardService {
    async getDashboardStats(organizationId, userRole, userId) {
        try {
            if (!organizationId) {
                console.log('No organizationId provided to getDashboardStats');
                return {
                    totalProperties: 0,
                    totalTenants: 0,
                    monthlyRevenue: 0,
                    occupancyRate: 0,
                    pendingMaintenance: 0,
                    recentPayments: 0
                };
            }
            let propertyFilter = { organizationId, status: { $ne: 'Archived' } };
            let tenantFilter = { organizationId, status: { $ne: 'Archived' } };
            let paymentFilter = { organizationId };
            if (userRole === 'Agent' && userId) {
                const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
                const userData = await User.findById(userId).select('managedProperties');
                const managedPropertyIds = userData?.managedProperties || [];
                propertyFilter._id = { $in: managedPropertyIds };
                tenantFilter.propertyId = { $in: managedPropertyIds };
                paymentFilter.propertyId = { $in: managedPropertyIds };
            }
            const [propertiesResult, tenantsResult, paymentsResult, remindersResult] = await Promise.allSettled([
                Property_1.default.find(propertyFilter).select('numberOfUnits').lean().exec(),
                Tenant_1.default.find(tenantFilter).select('status').lean().exec(),
                Payment_1.default.find({
                    ...paymentFilter,
                    paymentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }).select('amount paymentDate status').sort({ paymentDate: -1 }).limit(50).lean().exec(),
                Reminder_1.default.countDocuments({ organizationId, status: 'active', type: 'maintenance_reminder' }).exec()
            ]);
            const properties = propertiesResult.status === 'fulfilled' ? propertiesResult.value : [];
            const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
            const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value : [];
            const pendingMaintenance = remindersResult.status === 'fulfilled' ? remindersResult.value : 0;
            const totalUnits = properties.reduce((sum, prop) => sum + (prop.numberOfUnits || 1), 0);
            const occupiedUnits = tenants.filter(t => ['Active', 'Late'].includes(t.status)).length;
            const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            const monthlyPayments = payments.filter(p => p.paymentDate && new Date(p.paymentDate) >= currentMonth &&
                ['Paid', 'completed', 'Completed'].includes(p.status));
            const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentPayments = payments.filter(p => p.paymentDate && new Date(p.paymentDate) >= last24Hours &&
                ['Paid', 'completed', 'Completed'].includes(p.status)).length;
            const result = {
                totalProperties: properties.length,
                totalTenants: tenants.length,
                monthlyRevenue,
                occupancyRate,
                pendingMaintenance,
                recentPayments
            };
            console.log('Dashboard stats calculated:', result);
            return result;
        }
        catch (error) {
            console.error('Dashboard stats error:', error);
            return {
                totalProperties: 0,
                totalTenants: 0,
                monthlyRevenue: 0,
                occupancyRate: 0,
                pendingMaintenance: 0,
                recentPayments: 0
            };
        }
    }
    async getCashFlowData(organizationId, period = 'monthly') {
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const payments = await Payment_1.default.find({
                organizationId,
                paymentDate: { $gte: sixMonthsAgo },
                status: { $in: ['Paid', 'completed', 'Completed'] }
            })
                .select('amount paymentDate')
                .sort({ paymentDate: -1 })
                .lean()
                .exec();
            const monthlyData = payments.reduce((acc, payment) => {
                if (!payment.paymentDate)
                    return acc;
                const month = new Date(payment.paymentDate).toISOString().slice(0, 7);
                if (!acc[month])
                    acc[month] = { income: 0, expenses: 0 };
                acc[month].income += (payment.amount || 0);
                return acc;
            }, {});
            return Object.entries(monthlyData)
                .map(([month, data]) => ({
                month,
                income: data.income,
                expenses: data.expenses
            }))
                .sort((a, b) => a.month.localeCompare(b.month))
                .slice(-12);
        }
        catch (error) {
            console.error('Cash flow data error:', error);
            return [];
        }
    }
    async getUpcomingReminders(organizationId) {
        try {
            const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const upcoming = await Reminder_1.default.find({
                organizationId,
                status: 'active',
                nextRunDate: { $gte: new Date(), $lte: sevenDaysFromNow }
            })
                .populate('tenantId', 'name unit')
                .populate('propertyId', 'name')
                .select('type message nextRunDate tenantId propertyId')
                .sort({ nextRunDate: 1 })
                .limit(10)
                .lean()
                .exec();
            return upcoming || [];
        }
        catch (error) {
            console.error('Upcoming reminders error:', error);
            return [];
        }
    }
}
exports.default = new DashboardService();
