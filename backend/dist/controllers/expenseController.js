"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.getExpenseById = exports.updateExpense = exports.createExpense = exports.getExpenses = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const Property_1 = __importDefault(require("../models/Property"));
const getExpenses = async (req, res) => {
    const user = req.user;
    if (!user || (!user.organizationId && user.role !== 'Super Admin')) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { page = 1, limit = 50, category, propertyId, search, sortBy = 'date', sortOrder = 'desc', startDate, endDate, includeArchived = 'false' } = req.query;
        let query = user.role === 'Super Admin' && !user.organizationId
            ? {}
            : { organizationId: user.organizationId };
        if (includeArchived !== 'true') {
            query.status = 'Active';
        }
        if (category && category !== 'all') {
            query.category = category;
        }
        if (propertyId) {
            query.propertyId = propertyId;
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } },
                { 'vendor.name': { $regex: search, $options: 'i' } },
                { receiptNumber: { $regex: search, $options: 'i' } }
            ];
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [expenses, totalCount] = await Promise.all([
            Expense_1.default.find(query)
                .populate('propertyId', 'name address')
                .populate('createdBy', 'name email')
                .populate('paidToAgentId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean()
                .exec(),
            Expense_1.default.countDocuments(query)
        ]);
        const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const categoryStats = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            data: expenses,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalCount,
                hasNext: pageNum < Math.ceil(totalCount / limitNum),
                hasPrev: pageNum > 1
            },
            summary: {
                totalExpenses: totalCount,
                totalAmount,
                averageAmount: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
                categoryBreakdown: categoryStats
            }
        });
    }
    catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { description, amount, category, date, propertyId } = req.body;
        const requiredFields = { description, amount, category };
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
            .map(([key]) => key);
        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
            return;
        }
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            res.status(400).json({
                success: false,
                message: 'Amount must be a valid positive number'
            });
            return;
        }
        let expenseDate = new Date();
        if (date) {
            expenseDate = new Date(date);
            if (isNaN(expenseDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid date format'
                });
                return;
            }
            if (expenseDate > new Date()) {
                res.status(400).json({
                    success: false,
                    message: 'Expense date cannot be in the future'
                });
                return;
            }
        }
        if (propertyId) {
            const property = await Property_1.default.findById(propertyId);
            if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
                res.status(403).json({
                    success: false,
                    message: 'Invalid property or property not found'
                });
                return;
            }
        }
        const expenseData = {
            description: description.trim(),
            amount: amountNum,
            category,
            date: expenseDate,
            propertyId: propertyId || undefined,
            organizationId: user.organizationId,
            createdBy: user._id,
            status: 'Active'
        };
        if (req.body.vendor) {
            const vendor = req.body.vendor;
            expenseData.vendor = {};
            if (vendor.name)
                expenseData.vendor.name = vendor.name.trim().substring(0, 100);
            if (vendor.phone)
                expenseData.vendor.phone = vendor.phone.trim();
            if (vendor.email)
                expenseData.vendor.email = vendor.email.toLowerCase().trim();
        }
        if (req.body.paymentMethod) {
            expenseData.paymentMethod = req.body.paymentMethod.trim().substring(0, 50);
        }
        if (req.body.notes) {
            expenseData.notes = req.body.notes.trim().substring(0, 1000);
        }
        if (req.body.documentUrl) {
            expenseData.documentUrl = req.body.documentUrl;
        }
        if (req.body.receiptNumber) {
            expenseData.receiptNumber = req.body.receiptNumber.trim().substring(0, 50);
        }
        console.log('Creating expense:', {
            description: expenseData.description,
            amount: expenseData.amount,
            category: expenseData.category,
            propertyId: expenseData.propertyId
        });
        const newExpense = await Expense_1.default.create(expenseData);
        const populatedExpense = await Expense_1.default.findById(newExpense._id)
            .populate('propertyId', 'name address')
            .populate('createdBy', 'name email')
            .lean();
        res.status(201).json({
            success: true,
            data: populatedExpense,
            message: 'Expense created successfully'
        });
    }
    catch (error) {
        console.error('Create expense error:', error);
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
            message: 'Failed to create expense',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const expense = await Expense_1.default.findById(req.params.id);
        if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        const updatedExpense = await Expense_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedExpense });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateExpense = updateExpense;
const getExpenseById = async (req, res) => {
    try {
        if (!req.user?.organizationId && req.user?.role !== 'Super Admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const expense = await Expense_1.default.findById(req.params.id)
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name');
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        if (req.user.role !== 'Super Admin' && expense.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this expense' });
        }
        res.status(200).json({ success: true, data: expense });
    }
    catch (error) {
        console.error('Get expense by ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getExpenseById = getExpenseById;
const deleteExpense = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const expense = await Expense_1.default.findById(req.params.id);
        if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        await expense.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteExpense = deleteExpense;
