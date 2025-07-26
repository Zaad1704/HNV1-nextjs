"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCashFlowRecord = exports.updateCashFlowRecord = exports.getCashFlowRecords = exports.createCashFlowRecord = void 0;
const CashFlow_1 = __importDefault(require("../models/CashFlow"));
const createCashFlowRecord = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { amount, type, transactionDate, description, toUser, documentUrl } = req.body;
        if (!amount || !type) {
            return res.status(400).json({
                success: false,
                message: 'Amount and type are required'
            });
        }
        const newRecord = await CashFlow_1.default.create({
            organizationId: req.user.organizationId,
            fromUser: req.user._id,
            toUser: toUser || null,
            amount: Number(amount),
            type,
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            description: description || '',
            documentUrl: documentUrl || null,
            recordedBy: req.user._id,
            status: 'completed'
        });
        res.status(201).json({ success: true, data: newRecord });
    }
    catch (error) {
        console.error('Create cashflow error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.createCashFlowRecord = createCashFlowRecord;
const getCashFlowRecords = async (req, res) => {
    try {
        if (!req.user?.organizationId && req.user?.role !== 'Super Admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { tenantId, propertyId, type, startDate, endDate } = req.query;
        const query = req.user.role === 'Super Admin' && !req.user.organizationId
            ? {}
            : { organizationId: req.user.organizationId };
        if (tenantId)
            query.tenantId = tenantId;
        if (propertyId)
            query.propertyId = propertyId;
        if (type)
            query.type = type;
        if (startDate || endDate) {
            query.transactionDate = {};
            if (startDate)
                query.transactionDate.$gte = new Date(startDate);
            if (endDate)
                query.transactionDate.$lte = new Date(endDate);
        }
        const records = await CashFlow_1.default.find(query)
            .populate('tenantId', 'name unit')
            .populate('propertyId', 'name address')
            .sort({ transactionDate: -1 });
        res.status(200).json({ success: true, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getCashFlowRecords = getCashFlowRecords;
const updateCashFlowRecord = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const record = await CashFlow_1.default.findById(req.params.id);
        if (!record || record.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        const updatedRecord = await CashFlow_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedRecord });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateCashFlowRecord = updateCashFlowRecord;
const deleteCashFlowRecord = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const record = await CashFlow_1.default.findById(req.params.id);
        if (!record || record.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        await record.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteCashFlowRecord = deleteCashFlowRecord;
