"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApprovalRequest = exports.updateApprovalStatus = exports.getApprovalRequests = exports.createApprovalRequest = void 0;
const ApprovalRequest_1 = __importDefault(require("../models/ApprovalRequest"));
const createApprovalRequest = async (req, res) => {
    try {
        const { type, description, propertyId, tenantId, paymentId, expenseId, maintenanceId, requestData, priority } = req.body;
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const approvalRequest = new ApprovalRequest_1.default({
            type,
            description,
            requestedBy: req.user._id,
            organizationId: req.user.organizationId,
            propertyId,
            tenantId,
            paymentId,
            expenseId,
            maintenanceId,
            requestData,
            priority: priority || 'medium',
            status: 'pending'
        });
        await approvalRequest.save();
        res.status(201).json({
            success: true,
            message: 'Approval request created successfully',
            data: approvalRequest
        });
    }
    catch (error) {
        console.error('Create approval request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create approval request'
        });
    }
};
exports.createApprovalRequest = createApprovalRequest;
const getApprovalRequests = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const { status, type } = req.query;
        const query = { organizationId: req.user.organizationId };
        if (status)
            query.status = status;
        if (type)
            query.type = type;
        if (req.user.role === 'Agent') {
            query.requestedBy = req.user._id;
        }
        const approvals = await ApprovalRequest_1.default.find(query)
            .populate('requestedBy', 'name email')
            .populate('propertyId', 'name')
            .populate('tenantId', 'name unit')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: approvals
        });
    }
    catch (error) {
        console.error('Get approval requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approval requests'
        });
    }
};
exports.getApprovalRequests = getApprovalRequests;
const updateApprovalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected'
            });
        }
        if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only landlords can approve or reject requests'
            });
        }
        const updateData = {
            status,
            approvedBy: req.user._id,
            approvedAt: new Date()
        };
        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        const approval = await ApprovalRequest_1.default.findByIdAndUpdate(id, updateData, { new: true }).populate('requestedBy', 'name email');
        if (!approval) {
            return res.status(404).json({
                success: false,
                message: 'Approval request not found'
            });
        }
        res.status(200).json({
            success: true,
            message: `Request ${status} successfully`,
            data: approval
        });
    }
    catch (error) {
        console.error('Update approval status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update approval status'
        });
    }
};
exports.updateApprovalStatus = updateApprovalStatus;
const deleteApprovalRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const approval = await ApprovalRequest_1.default.findById(id);
        if (!approval) {
            return res.status(404).json({
                success: false,
                message: 'Approval request not found'
            });
        }
        if (approval.requestedBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'Landlord' &&
            req.user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this request'
            });
        }
        await approval.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Approval request deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete approval request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete approval request'
        });
    }
};
exports.deleteApprovalRequest = deleteApprovalRequest;
