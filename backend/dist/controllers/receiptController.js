"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentReceipt = exports.bulkReceiptActions = exports.getReceiptSummary = exports.searchReceipts = exports.createReceipt = exports.getReceipts = void 0;
const Receipt_1 = __importDefault(require("../models/Receipt"));
const Payment_1 = __importDefault(require("../models/Payment"));
const receiptGenerator_1 = require("../utils/receiptGenerator");
const getReceipts = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { page = 1, limit = 50, status, category, propertyId, tenantId, search, sortBy = 'paymentDate', sortOrder = 'desc', startDate, endDate, rentMonth } = req.query;
        let query = { organizationId: user.organizationId };
        if (status && status !== 'all')
            query.status = status;
        if (category && category !== 'all')
            query.category = category;
        if (propertyId)
            query.propertyId = propertyId;
        if (tenantId)
            query.tenantId = tenantId;
        if (rentMonth)
            query.rentMonth = rentMonth;
        if (startDate || endDate) {
            query.paymentDate = {};
            if (startDate)
                query.paymentDate.$gte = new Date(startDate);
            if (endDate)
                query.paymentDate.$lte = new Date(endDate);
        }
        if (search) {
            query.$or = [
                { receiptNumber: { $regex: search, $options: 'i' } },
                { tenantName: { $regex: search, $options: 'i' } },
                { propertyName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [receipts, totalCount] = await Promise.all([
            Receipt_1.default.find(query)
                .populate('tenantId', 'name email unit')
                .populate('propertyId', 'name address')
                .populate('paymentId', 'amount status paymentMethod')
                .populate('issuedBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean()
                .exec(),
            Receipt_1.default.countDocuments(query)
        ]);
        const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
        const categoryStats = receipts.reduce((acc, receipt) => {
            acc[receipt.category] = (acc[receipt.category] || 0) + 1;
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            data: receipts,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalCount,
                hasNext: pageNum < Math.ceil(totalCount / limitNum),
                hasPrev: pageNum > 1
            },
            summary: {
                totalReceipts: totalCount,
                totalAmount,
                categoryStats
            }
        });
    }
    catch (error) {
        console.error('Get receipts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getReceipts = getReceipts;
const createReceipt = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { paymentId, title, category, description, notes } = req.body;
        if (!paymentId) {
            res.status(400).json({ success: false, message: 'Payment ID is required' });
            return;
        }
        const payment = await Payment_1.default.findById(paymentId)
            .populate('tenantId', 'name unit')
            .populate('propertyId', 'name');
        if (!payment || payment.organizationId.toString() !== user.organizationId.toString()) {
            res.status(400).json({ success: false, message: 'Invalid payment' });
            return;
        }
        const existingReceipt = await Receipt_1.default.findOne({ paymentId });
        if (existingReceipt) {
            res.status(400).json({ success: false, message: 'Receipt already exists for this payment' });
            return;
        }
        const receiptData = {
            tenantId: payment.tenantId._id,
            propertyId: payment.propertyId._id,
            organizationId: user.organizationId,
            paymentId,
            title: title || `Receipt for ${payment.tenantId.name}`,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            category: category || 'Rent',
            tenantName: payment.tenantId.name,
            propertyName: payment.propertyId.name,
            unitNumber: payment.tenantId.unit || 'N/A',
            description: description || `Payment receipt for ${payment.tenantId.name}`,
            notes: notes || undefined,
            transactionId: payment.transactionId || undefined,
            issuedBy: user._id,
            status: 'Generated'
        };
        const receipt = await Receipt_1.default.create(receiptData);
        const populatedReceipt = await Receipt_1.default.findById(receipt._id)
            .populate('tenantId', 'name email unit')
            .populate('propertyId', 'name address')
            .populate('paymentId', 'amount status')
            .populate('issuedBy', 'name email')
            .lean();
        res.status(201).json({
            success: true,
            data: populatedReceipt,
            message: 'Receipt created successfully'
        });
    }
    catch (error) {
        console.error('Create receipt error:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create receipt',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.createReceipt = createReceipt;
const searchReceipts = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { q, limit = 20 } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
            return;
        }
        const receipts = await Receipt_1.default.find({
            organizationId: user.organizationId,
            $or: [
                { receiptNumber: { $regex: q, $options: 'i' } },
                { tenantName: { $regex: q, $options: 'i' } },
                { propertyName: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        })
            .populate('tenantId', 'name unit')
            .populate('propertyId', 'name address')
            .select('receiptNumber tenantName propertyName amount paymentDate status category')
            .sort({ paymentDate: -1 })
            .limit(Math.min(50, parseInt(limit)))
            .lean();
        res.status(200).json({ success: true, data: receipts });
    }
    catch (error) {
        console.error('Search receipts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search receipts',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.searchReceipts = searchReceipts;
const getReceiptSummary = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const [receipts, currentMonth, lastMonth] = await Promise.all([
            Receipt_1.default.find({ organizationId: user.organizationId }).lean(),
            Receipt_1.default.find({
                organizationId: user.organizationId,
                paymentDate: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                }
            }).lean(),
            Receipt_1.default.find({
                organizationId: user.organizationId,
                paymentDate: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }).lean()
        ]);
        const totalReceipts = receipts.length;
        const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
        const currentMonthAmount = currentMonth.reduce((sum, r) => sum + (r.amount || 0), 0);
        const lastMonthAmount = lastMonth.reduce((sum, r) => sum + (r.amount || 0), 0);
        const monthlyGrowth = lastMonthAmount > 0 ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;
        const statusDistribution = receipts.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {});
        const categoryDistribution = receipts.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalReceipts,
                    totalAmount,
                    averageAmount: totalReceipts > 0 ? Math.round(totalAmount / totalReceipts) : 0,
                    currentMonthReceipts: currentMonth.length,
                    lastMonthReceipts: lastMonth.length
                },
                monthly: {
                    currentMonth: currentMonthAmount,
                    lastMonth: lastMonthAmount,
                    growth: Math.round(monthlyGrowth * 100) / 100
                },
                distributions: {
                    status: statusDistribution,
                    category: categoryDistribution
                }
            }
        });
    }
    catch (error) {
        console.error('Get receipt summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipt summary',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getReceiptSummary = getReceiptSummary;
const bulkReceiptActions = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { action, receiptIds } = req.body;
        if (!action || !receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid request data' });
            return;
        }
        const receipts = await Receipt_1.default.find({
            _id: { $in: receiptIds },
            organizationId: user.organizationId
        });
        if (receipts.length !== receiptIds.length) {
            res.status(403).json({ success: false, message: 'Some receipts not found or not authorized' });
            return;
        }
        let results = [];
        switch (action) {
            case 'mark_sent':
                await Receipt_1.default.updateMany({ _id: { $in: receiptIds } }, { status: 'Sent', sentAt: new Date() });
                results = receiptIds.map(id => ({ receiptId: id, status: 'sent' }));
                break;
            case 'mark_downloaded':
                await Receipt_1.default.updateMany({ _id: { $in: receiptIds } }, { status: 'Downloaded', downloadedAt: new Date() });
                results = receiptIds.map(id => ({ receiptId: id, status: 'downloaded' }));
                break;
            case 'mark_printed':
                await Receipt_1.default.updateMany({ _id: { $in: receiptIds } }, { status: 'Printed', printedAt: new Date() });
                results = receiptIds.map(id => ({ receiptId: id, status: 'printed' }));
                break;
            default:
                res.status(400).json({ success: false, message: 'Unknown action' });
                return;
        }
        res.status(200).json({
            success: true,
            data: {
                action,
                processedCount: results.length,
                results
            },
            message: `Bulk ${action} completed successfully`
        });
    }
    catch (error) {
        console.error('Bulk receipt action error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.bulkReceiptActions = bulkReceiptActions;
const generatePaymentReceipt = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const paymentId = req.params.paymentId;
        const { format: printFormat = 'standard' } = req.query;
        const language = user?.language || 'en';
        const payment = await Payment_1.default.findById(paymentId)
            .populate('tenantId', 'name email phone unit')
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .populate('recordedBy', 'name')
            .lean();
        if (!payment || payment.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Payment not found' });
            return;
        }
        if (printFormat === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment._id}.pdf"`);
            return (0, receiptGenerator_1.generateColorfulPdfReceipt)(payment, res, language);
        }
        if (printFormat === 'thermal') {
            const thermalReceipt = (0, receiptGenerator_1.generateEnhancedThermalReceipt)(payment);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment._id}-thermal.txt"`);
            return res.send(thermalReceipt);
        }
        res.status(200).json({ success: true, data: payment });
    }
    catch (error) {
        console.error('Generate receipt error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate receipt',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.generatePaymentReceipt = generatePaymentReceipt;
