"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOrgStatus = exports.updateOrganization = exports.getOrganizations = exports.getMyOrganization = void 0;
const Organization_1 = __importDefault(require("../models/Organization"));
const getMyOrganization = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const organization = await Organization_1.default.findById(req.user.organizationId)
            .populate('owner', 'name email')
            .populate('subscription.planId', 'name price features');
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        res.status(200).json({ success: true, data: organization });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMyOrganization = getMyOrganization;
const getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization_1.default.find()
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: organizations || [] });
    }
    catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch organizations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.getOrganizations = getOrganizations;
const updateOrganization = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const organization = await Organization_1.default.findByIdAndUpdate(req.user.organizationId, req.body, { new: true });
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        res.status(200).json({ success: true, data: organization });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateOrganization = updateOrganization;
const setOrgStatus = async (req, res) => {
    try {
        const { orgId, status } = req.body;
        if (!orgId || !status) {
            return res.status(400).json({ success: false, message: 'Organization ID and status are required' });
        }
        const organization = await Organization_1.default.findByIdAndUpdate(orgId, { status }, { new: true });
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        res.status(200).json({
            success: true,
            message: `Organization ${organization.name} status updated to ${organization.status}`,
            data: organization
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.setOrgStatus = setOrgStatus;
