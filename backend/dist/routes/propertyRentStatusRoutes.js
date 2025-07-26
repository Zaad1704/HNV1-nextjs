"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Payment_1 = __importDefault(require("../models/Payment"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/:propertyId/rent-status/:year', async (req, res) => {
    try {
        const { propertyId, year } = req.params;
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        const payments = await Payment_1.default.find({
            propertyId,
            organizationId: req.user.organizationId,
            paymentDate: { $gte: startDate, $lte: endDate },
            status: { $in: ['Paid', 'completed'] }
        }).populate('tenantId', 'name unit');
        const tenants = await Tenant_1.default.find({
            propertyId,
            organizationId: req.user.organizationId,
            status: 'Active'
        });
        const months = Array.from({ length: 12 }, (_, i) => ({
            paid: 0,
            due: 0,
            paidTenants: [],
            dueTenants: []
        }));
        let totalPaid = 0;
        let totalDue = 0;
        const paidTenants = new Set();
        const dueTenants = new Set();
        tenants.forEach(tenant => {
            const tenantStartDate = new Date(tenant.createdAt || `${year}-01-01`);
            const startMonth = tenantStartDate.getFullYear() === parseInt(year) ? tenantStartDate.getMonth() : 0;
            const endMonth = 11;
            for (let month = startMonth; month <= endMonth; month++) {
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                const payment = payments.find(p => p.tenantId._id.toString() === tenant._id.toString() &&
                    p.rentMonth === monthKey);
                if (payment) {
                    months[month].paid += payment.amount;
                    months[month].paidTenants.push({
                        _id: tenant._id,
                        name: tenant.name,
                        unit: tenant.unit,
                        amount: payment.amount
                    });
                    totalPaid += payment.amount;
                    paidTenants.add(tenant._id.toString());
                }
                else {
                    months[month].due += tenant.rentAmount || 0;
                    months[month].dueTenants.push({
                        _id: tenant._id,
                        name: tenant.name,
                        unit: tenant.unit,
                        amount: tenant.rentAmount || 0
                    });
                    totalDue += tenant.rentAmount || 0;
                    dueTenants.add(tenant._id.toString());
                }
            }
        });
        res.status(200).json({
            success: true,
            data: {
                totalPaid,
                totalDue,
                paidCount: paidTenants.size,
                dueCount: dueTenants.size,
                months,
                paidTenantsList: Array.from(paidTenants).map(id => tenants.find(t => t._id.toString() === id)),
                dueTenantsList: Array.from(dueTenants).map(id => tenants.find(t => t._id.toString() === id))
            }
        });
    }
    catch (error) {
        console.error('Rent status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:propertyId/rent-details/:month', async (req, res) => {
    try {
        const { propertyId, month } = req.params;
        const payments = await Payment_1.default.find({
            propertyId,
            organizationId: req.user.organizationId,
            rentMonth: month,
            status: { $in: ['Paid', 'completed'] }
        }).populate('tenantId', 'name unit rentAmount');
        const allTenants = await Tenant_1.default.find({
            propertyId,
            organizationId: req.user.organizationId,
            status: 'Active'
        });
        const paidTenantIds = payments.map(p => p.tenantId._id.toString());
        const dueTenants = allTenants.filter(tenant => !paidTenantIds.includes(tenant._id.toString()));
        res.status(200).json({
            success: true,
            data: {
                paid: payments,
                due: dueTenants,
                totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
                totalDue: dueTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
            }
        });
    }
    catch (error) {
        console.error('Rent details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
