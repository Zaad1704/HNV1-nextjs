"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMaintenanceRequest = exports.getTenantDashboard = void 0;
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const getTenantDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'Tenant') {
            return res.status(403).json({ success: false, message: 'Tenant access only' });
        }
        let tenant;
        if (req.user.tenantId) {
            tenant = await Tenant_1.default.findById(req.user.tenantId).populate('propertyId', 'name address');
        }
        else {
            tenant = await Tenant_1.default.findOne({
                email: req.user.email,
                organizationId: req.user.organizationId
            }).populate('propertyId', 'name address');
        }
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant record not found'
            });
        }
        const payments = await Payment_1.default.find({
            tenantId: tenant._id,
            organizationId: req.user.organizationId
        }).sort({ paymentDate: -1 }).limit(5);
        const maintenanceRequests = await MaintenanceRequest_1.default.find({
            tenantId: tenant._id,
            organizationId: req.user.organizationId
        }).sort({ createdAt: -1 }).limit(5);
        const dashboardData = {
            tenant: {
                name: tenant.name,
                unit: tenant.unit,
                rentAmount: tenant.rentAmount,
                status: tenant.status,
                leaseEndDate: tenant.leaseEndDate
            },
            property: tenant.propertyId,
            payments: payments.map(p => ({
                _id: p._id,
                amount: p.amount,
                paymentDate: p.paymentDate,
                status: p.status,
                description: p.description
            })),
            maintenanceRequests: maintenanceRequests.map(m => ({
                _id: m._id,
                description: m.description,
                status: m.status,
                priority: m.priority,
                createdAt: m.createdAt
            }))
        };
        res.json({ success: true, data: dashboardData });
    }
    catch (error) {
        console.error('Tenant dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getTenantDashboard = getTenantDashboard;
const createMaintenanceRequest = async (req, res) => {
    try {
        if (req.user.role !== 'Tenant') {
            return res.status(403).json({ success: false, message: 'Tenant access only' });
        }
        const { description, priority, category } = req.body;
        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Description is required'
            });
        }
        let tenant;
        if (req.user.tenantId) {
            tenant = await Tenant_1.default.findById(req.user.tenantId);
        }
        else {
            tenant = await Tenant_1.default.findOne({
                email: req.user.email,
                organizationId: req.user.organizationId
            });
        }
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant record not found'
            });
        }
        const maintenanceRequest = await MaintenanceRequest_1.default.create({
            organizationId: req.user.organizationId,
            propertyId: tenant.propertyId,
            tenantId: tenant._id,
            description,
            priority: priority || 'medium',
            category: category || 'general',
            status: 'pending',
            requestedBy: req.user._id
        });
        res.status(201).json({
            success: true,
            data: maintenanceRequest
        });
    }
    catch (error) {
        console.error('Create maintenance request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createMaintenanceRequest = createMaintenanceRequest;
