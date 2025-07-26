"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectEditRequest = exports.approveEditRequest = exports.updateEditRequest = exports.createEditRequest = exports.getEditRequests = void 0;
const EditRequest_1 = __importDefault(require("../models/EditRequest"));
const getEditRequests = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const editRequests = await EditRequest_1.default.find({
            organizationId: req.user.organizationId,
            status: 'pending'
        })
            .populate('requester', 'name email')
            .populate('resourceId')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        res.status(200).json({ success: true, data: editRequests || [] });
    }
    catch (error) {
        console.error('Error fetching edit requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch edit requests',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.getEditRequests = getEditRequests;
const createEditRequest = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { resourceId, resourceModel, reason } = req.body;
        if (!resourceId || !resourceModel || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Resource ID, model, and reason are required'
            });
        }
        const editRequest = await EditRequest_1.default.create({
            resourceId,
            resourceModel,
            reason,
            organizationId: req.user.organizationId,
            requester: req.user._id,
            status: 'pending'
        });
        res.status(201).json({ success: true, data: editRequest });
    }
    catch (error) {
        console.error('Error creating edit request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createEditRequest = createEditRequest;
const updateEditRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be approved or rejected'
            });
        }
        const editRequest = await EditRequest_1.default.findByIdAndUpdate(id, {
            status,
            approver: req.user._id
        }, { new: true }).populate('requester', 'name email');
        if (!editRequest) {
            return res.status(404).json({ success: false, message: 'Edit request not found' });
        }
        res.json({ success: true, data: editRequest });
    }
    catch (error) {
        console.error('Error updating edit request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateEditRequest = updateEditRequest;
const approveEditRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const editRequest = await EditRequest_1.default.findByIdAndUpdate(id, {
            status: 'approved',
            approver: req.user._id
        }, { new: true });
        if (!editRequest) {
            return res.status(404).json({ success: false, message: 'Edit request not found' });
        }
        res.json({ success: true, data: editRequest });
    }
    catch (error) {
        console.error('Error approving edit request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.approveEditRequest = approveEditRequest;
const rejectEditRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const editRequest = await EditRequest_1.default.findByIdAndUpdate(id, {
            status: 'rejected',
            approver: req.user._id
        }, { new: true });
        if (!editRequest) {
            return res.status(404).json({ success: false, message: 'Edit request not found' });
        }
        res.json({ success: true, data: editRequest });
    }
    catch (error) {
        console.error('Error rejecting edit request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.rejectEditRequest = rejectEditRequest;
