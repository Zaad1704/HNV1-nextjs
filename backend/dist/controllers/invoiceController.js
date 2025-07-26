"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailInvoice = exports.sendWhatsAppInvoice = exports.bulkDownloadInvoices = exports.printInvoice = exports.getInvoiceById = exports.generateInvoices = exports.getInvoices = exports.bulkInvoiceActions = exports.getInvoiceSummary = exports.searchInvoices = exports.createInvoice = void 0;
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Lease_1 = __importDefault(require("../models/Lease"));
const date_fns_1 = require("date-fns");
const pdfkit_1 = __importDefault(require("pdfkit"));
const createInvoice = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { tenantId, propertyId, title, category, dueDate, lineItems, notes, priority } = req.body;
        const requiredFields = { tenantId, propertyId, category, dueDate, lineItems };
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || (Array.isArray(value) && value.length === 0))
            .map(([key]) => key);
        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
            return;
        }
        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            res.status(400).json({
                success: false,
                message: 'At least one line item is required'
            });
            return;
        }
        const [tenant, property] = await Promise.all([
            require('../models/Tenant').default.findById(tenantId),
            require('../models/Property').default.findById(propertyId)
        ]);
        if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(400).json({ success: false, message: 'Invalid tenant' });
            return;
        }
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(400).json({ success: false, message: 'Invalid property' });
            return;
        }
        const count = await Invoice_1.default.countDocuments({ organizationId: user.organizationId });
        const invoiceNumber = `INV-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
        const processedLineItems = lineItems.map((item) => ({
            description: item.description.trim(),
            quantity: parseFloat(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            amount: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0),
            taxRate: parseFloat(item.taxRate) || 0
        }));
        const subtotal = processedLineItems.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = req.body.taxAmount ? parseFloat(req.body.taxAmount) : 0;
        const discountAmount = req.body.discountAmount ? parseFloat(req.body.discountAmount) : 0;
        const totalAmount = subtotal + taxAmount - discountAmount;
        const invoiceData = {
            tenantId,
            propertyId,
            organizationId: user.organizationId,
            invoiceNumber,
            title: title?.trim() || `Invoice for ${tenant.name}`,
            category,
            priority: priority || 'Medium',
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            amount: totalAmount,
            issueDate: new Date(),
            dueDate: new Date(dueDate),
            lineItems: processedLineItems,
            notes: notes?.trim() || undefined,
            paymentTerms: req.body.paymentTerms?.trim() || undefined,
            status: 'Draft',
            createdBy: user._id
        };
        const invoice = await Invoice_1.default.create(invoiceData);
        const populatedInvoice = await Invoice_1.default.findById(invoice._id)
            .populate('tenantId', 'name email phone unit')
            .populate('propertyId', 'name address')
            .populate('createdBy', 'name email')
            .lean();
        res.status(201).json({
            success: true,
            data: populatedInvoice,
            message: 'Invoice created successfully'
        });
    }
    catch (error) {
        console.error('Create invoice error:', error);
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
            message: 'Failed to create invoice',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.createInvoice = createInvoice;
const searchInvoices = async (req, res) => {
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
        let query = {
            organizationId: user.organizationId,
            $or: [
                { invoiceNumber: { $regex: q, $options: 'i' } },
                { title: { $regex: q, $options: 'i' } },
                { notes: { $regex: q, $options: 'i' } }
            ]
        };
        const invoices = await Invoice_1.default.find(query)
            .populate('tenantId', 'name unit')
            .populate('propertyId', 'name address')
            .select('invoiceNumber title totalAmount status category issueDate dueDate tenantId propertyId')
            .sort({ issueDate: -1 })
            .limit(Math.min(50, parseInt(limit)))
            .lean();
        res.status(200).json({
            success: true,
            data: invoices
        });
    }
    catch (error) {
        console.error('Search invoices error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search invoices',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.searchInvoices = searchInvoices;
const getInvoiceSummary = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        let query = { organizationId: user.organizationId };
        const [invoices, currentMonth, lastMonth] = await Promise.all([
            Invoice_1.default.find(query).lean(),
            Invoice_1.default.find({
                ...query,
                issueDate: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                }
            }).lean(),
            Invoice_1.default.find({
                ...query,
                issueDate: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }).lean()
        ]);
        const totalInvoices = invoices.length;
        const totalAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        const paidInvoices = invoices.filter(i => i.status === 'Paid');
        const overdueInvoices = invoices.filter(i => i.dueDate && new Date() > new Date(i.dueDate) && i.status !== 'Paid');
        const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        const currentMonthAmount = currentMonth.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        const lastMonthAmount = lastMonth.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        const monthlyGrowth = lastMonthAmount > 0 ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;
        const statusDistribution = invoices.reduce((acc, i) => {
            acc[i.status] = (acc[i.status] || 0) + 1;
            return acc;
        }, {});
        const categoryDistribution = invoices.reduce((acc, i) => {
            acc[i.category] = (acc[i.category] || 0) + 1;
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalInvoices,
                    totalAmount,
                    paidAmount,
                    overdueAmount,
                    pendingAmount: totalAmount - paidAmount,
                    collectionRate: totalInvoices > 0 ? Math.round((paidInvoices.length / totalInvoices) * 100) : 0
                },
                monthly: {
                    currentMonth: currentMonthAmount,
                    lastMonth: lastMonthAmount,
                    growth: Math.round(monthlyGrowth * 100) / 100,
                    currentMonthCount: currentMonth.length,
                    lastMonthCount: lastMonth.length
                },
                distributions: {
                    status: statusDistribution,
                    category: categoryDistribution
                },
                overdue: {
                    count: overdueInvoices.length,
                    amount: overdueAmount,
                    avgDaysOverdue: overdueInvoices.length > 0 ?
                        Math.round(overdueInvoices.reduce((sum, i) => {
                            const days = Math.ceil((new Date().getTime() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                            return sum + days;
                        }, 0) / overdueInvoices.length) : 0
                }
            }
        });
    }
    catch (error) {
        console.error('Get invoice summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice summary',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getInvoiceSummary = getInvoiceSummary;
const bulkInvoiceActions = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { action, invoiceIds, data } = req.body;
        if (!action || !invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid request data' });
            return;
        }
        const invoices = await Invoice_1.default.find({
            _id: { $in: invoiceIds },
            organizationId: user.organizationId
        });
        if (invoices.length !== invoiceIds.length) {
            res.status(403).json({ success: false, message: 'Some invoices not found or not authorized' });
            return;
        }
        let results = [];
        let errors = [];
        switch (action) {
            case 'update_status':
                if (!data || !data.status) {
                    res.status(400).json({ success: false, message: 'Status update requires new status' });
                    return;
                }
                const validStatuses = ['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Cancelled', 'Refunded'];
                if (!validStatuses.includes(data.status)) {
                    res.status(400).json({ success: false, message: 'Invalid status' });
                    return;
                }
                await Invoice_1.default.updateMany({ _id: { $in: invoiceIds } }, { status: data.status });
                results = invoiceIds.map(id => ({ invoiceId: id, newStatus: data.status }));
                break;
            case 'send_invoices':
                await Invoice_1.default.updateMany({ _id: { $in: invoiceIds } }, { status: 'Sent', sentAt: new Date() });
                results = invoiceIds.map(id => ({ invoiceId: id, status: 'sent' }));
                break;
            case 'mark_paid':
                await Invoice_1.default.updateMany({ _id: { $in: invoiceIds } }, { status: 'Paid', paidAt: new Date() });
                results = invoiceIds.map(id => ({ invoiceId: id, status: 'paid' }));
                break;
            default:
                res.status(400).json({ success: false, message: 'Unknown action' });
                return;
        }
        res.status(200).json({
            success: errors.length === 0,
            data: {
                action,
                processedCount: results.length,
                results,
                errors
            },
            message: `Bulk ${action} completed${errors.length > 0 ? ` with ${errors.length} errors` : ' successfully'}`
        });
    }
    catch (error) {
        console.error('Bulk invoice action error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.bulkInvoiceActions = bulkInvoiceActions;
const getInvoices = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { page = 1, limit = 50, status, priority, category, propertyId, tenantId, search, sortBy = 'issueDate', sortOrder = 'desc', overdue = 'false', startDate, endDate } = req.query;
        let query = { organizationId: user.organizationId };
        if (status && status !== 'all') {
            query.status = status;
        }
        if (priority && priority !== 'all') {
            query.priority = priority;
        }
        if (category && category !== 'all') {
            query.category = category;
        }
        if (propertyId) {
            query.propertyId = propertyId;
        }
        if (tenantId) {
            query.tenantId = tenantId;
        }
        if (overdue === 'true') {
            query.dueDate = { $lt: new Date() };
            query.status = { $nin: ['Paid', 'Cancelled'] };
        }
        if (startDate || endDate) {
            query.issueDate = {};
            if (startDate) {
                query.issueDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.issueDate.$lte = new Date(endDate);
            }
        }
        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const managedProperties = await Property.find({
                organizationId: user.organizationId,
                managedByAgentId: user._id
            }).select('_id');
            const managedPropertyIds = managedProperties.map(p => p._id);
            query.propertyId = { $in: managedPropertyIds };
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [invoices, totalCount] = await Promise.all([
            Invoice_1.default.find(query)
                .populate('tenantId', 'name email phone unit')
                .populate('propertyId', 'name address')
                .populate('createdBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean()
                .exec(),
            Invoice_1.default.countDocuments(query)
        ]);
        const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
        const paidAmount = invoices.filter(i => i.status === 'Paid').reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
        const overdueAmount = invoices.filter(i => i.dueDate && new Date() > new Date(i.dueDate) && i.status !== 'Paid').reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
        res.status(200).json({
            success: true,
            data: invoices,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalCount,
                hasNext: pageNum < Math.ceil(totalCount / limitNum),
                hasPrev: pageNum > 1
            },
            summary: {
                totalInvoices: totalCount,
                totalAmount,
                paidAmount,
                overdueAmount,
                pendingAmount: totalAmount - paidAmount
            }
        });
    }
    catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getInvoices = getInvoices;
const generateInvoices = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : (0, date_fns_1.addMonths)(new Date(), 1);
        const invoiceMonthStart = (0, date_fns_1.startOfMonth)(targetDate);
        const activeLeases = await Lease_1.default.find({
            organizationId: req.user.organizationId,
            status: 'active'
        }).populate('tenantId').populate('propertyId');
        if (activeLeases.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No active leases found to generate invoices for.'
            });
        }
        const invoicesToCreate = [];
        let countForMonth = await Invoice_1.default.countDocuments({
            organizationId: req.user.organizationId,
            createdAt: { $gte: invoiceMonthStart }
        });
        for (const lease of activeLeases) {
            const existingInvoice = await Invoice_1.default.findOne({
                leaseId: lease._id,
                dueDate: invoiceMonthStart,
                status: { $in: ['pending', 'overdue'] }
            });
            if (existingInvoice) {
                continue;
            }
            const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${(0, date_fns_1.format)(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`;
            invoicesToCreate.push({
                tenantId: lease.tenantId._id,
                propertyId: lease.propertyId._id,
                organizationId: req.user.organizationId,
                leaseId: lease._id,
                invoiceNumber,
                amount: lease.rentAmount,
                dueDate: invoiceMonthStart,
                status: 'pending',
                lineItems: [{
                        description: `Rent for ${(0, date_fns_1.format)(invoiceMonthStart, 'MMM yyyy')}`,
                        amount: lease.rentAmount
                    }]
            });
            countForMonth++;
        }
        if (invoicesToCreate.length > 0) {
            await Invoice_1.default.insertMany(invoicesToCreate);
        }
        res.status(201).json({
            success: true,
            message: `${invoicesToCreate.length} new invoices generated successfully for ${(0, date_fns_1.format)(invoiceMonthStart, 'MMM yyyy')}.`,
            data: { count: invoicesToCreate.length }
        });
    }
    catch (error) {
        console.error('Generate invoices error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.generateInvoices = generateInvoices;
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice_1.default.findById(req.params.id)
            .populate('tenantId', 'name email phone')
            .populate('propertyId', 'name address')
            .populate('leaseId');
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: invoice });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getInvoiceById = getInvoiceById;
const printInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { format: printFormat = 'standard' } = req.query;
        const invoice = await Invoice_1.default.findById(id)
            .populate('tenantId', 'name email phone')
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .lean();
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        if (printFormat === 'thermal') {
            const thermalReceipt = generateThermalReceipt(invoice);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}-thermal.txt"`);
            return res.send(thermalReceipt);
        }
        if (printFormat === 'pdf') {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            const filename = `invoice-${invoice.invoiceNumber}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            doc.pipe(res);
            generatePDFInvoice(doc, invoice);
            doc.end();
            return;
        }
        res.status(200).json({ success: true, data: invoice });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.printInvoice = printInvoice;
const generateThermalReceipt = (invoice) => {
    const line = '--------------------------------';
    const doubleLine = '================================';
    return `
${doubleLine}
    ${(invoice.organizationId?.name || 'ORGANIZATION').toUpperCase()}
${doubleLine}

RENT INVOICE
Invoice #: ${invoice.invoiceNumber}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

${line}
TENANT INFORMATION
${line}
Name: ${invoice.tenantId?.name || 'N/A'}
Email: ${invoice.tenantId?.email || 'N/A'}
Phone: ${invoice.tenantId?.phone || 'N/A'}

${line}
PROPERTY INFORMATION
${line}
Property: ${invoice.propertyId?.name || 'N/A'}
Address: ${invoice.propertyId?.address || 'N/A'}

${line}
ITEMS
${line}
${invoice.lineItems?.map((item) => `${item.description}\n$${item.amount.toFixed(2)}`).join('\n\n') || 'No items'}

${line}
TOTAL: $${invoice.amount.toFixed(2)}
Status: ${invoice.status.toUpperCase()}
${line}

Thank you for your payment!

${line}
Powered by HNV Property
Management Solutions
${doubleLine}
`;
};
const generatePDFInvoice = (doc, invoice) => {
    const orgName = invoice.organizationId?.name || 'ORGANIZATION';
    doc.fontSize(20).font('Helvetica-Bold').text(orgName.toUpperCase(), 50, 50, { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('RENT INVOICE', 50, 80, { align: 'center' });
    doc.fontSize(12).font('Helvetica');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 50, 120);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 140);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 160);
    doc.fontSize(14).font('Helvetica-Bold').text('TENANT INFORMATION', 50, 200);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Name: ${invoice.tenantId?.name || 'N/A'}`, 50, 220);
    doc.text(`Email: ${invoice.tenantId?.email || 'N/A'}`, 50, 240);
    doc.text(`Phone: ${invoice.tenantId?.phone || 'N/A'}`, 50, 260);
    doc.fontSize(14).font('Helvetica-Bold').text('PROPERTY INFORMATION', 50, 300);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Property: ${invoice.propertyId?.name || 'N/A'}`, 50, 320);
    doc.text(`Address: ${invoice.propertyId?.address || 'N/A'}`, 50, 340);
    doc.fontSize(14).font('Helvetica-Bold').text('ITEMS', 50, 380);
    let yPos = 400;
    if (invoice.lineItems && invoice.lineItems.length > 0) {
        invoice.lineItems.forEach((item) => {
            doc.fontSize(12).font('Helvetica');
            doc.text(item.description, 50, yPos);
            doc.text(`$${item.amount.toFixed(2)}`, 450, yPos, { align: 'right' });
            yPos += 20;
        });
    }
    else {
        doc.fontSize(12).font('Helvetica').text('No items', 50, yPos);
        yPos += 20;
    }
    doc.moveTo(50, yPos + 10).lineTo(550, yPos + 10).stroke();
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('TOTAL:', 50, yPos + 20);
    doc.text(`$${invoice.amount.toFixed(2)}`, 450, yPos + 20, { align: 'right' });
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, yPos + 40);
    doc.fontSize(12).font('Helvetica').text('Thank you for your payment!', 50, yPos + 80, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Powered by HNV Property Management Solutions', 50, 750, { align: 'center' });
};
const bulkDownloadInvoices = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { ids, status, dateFrom, dateTo, format = 'thermal' } = req.query;
        let query = { organizationId: req.user.organizationId };
        if (ids) {
            query._id = { $in: ids.split(',') };
        }
        if (status) {
            query.status = status;
        }
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom)
                query.createdAt.$gte = new Date(dateFrom);
            if (dateTo)
                query.createdAt.$lte = new Date(dateTo);
        }
        const invoices = await Invoice_1.default.find(query)
            .populate('tenantId', 'name email phone')
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .lean();
        if (format === 'thermal') {
            const bulkReceipts = invoices.map(invoice => `${generateThermalReceipt(invoice)}\n\n${'='.repeat(50)}\n\n`).join('');
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="bulk-invoices-${Date.now()}.txt"`);
            return res.send(bulkReceipts);
        }
        res.status(200).json({ success: true, data: invoices });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.bulkDownloadInvoices = bulkDownloadInvoices;
const sendWhatsAppInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone, message } = req.body;
        const invoice = await Invoice_1.default.findById(id)
            .populate('tenantId', 'name phone')
            .populate('organizationId', 'name')
            .lean();
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        const recipientPhone = phone || invoice.tenantId?.phone;
        if (!recipientPhone) {
            return res.status(400).json({ success: false, message: 'Phone number required' });
        }
        const whatsappMessage = message || `Hi ${invoice.tenantId?.name}, your invoice #${invoice.invoiceNumber} for $${invoice.amount} is ready. Amount due: $${invoice.amount}. Thank you!`;
        const whatsappUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        res.status(200).json({
            success: true,
            data: {
                whatsappUrl,
                message: whatsappMessage,
                phone: recipientPhone
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.sendWhatsAppInvoice = sendWhatsAppInvoice;
const sendEmailInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, subject, message } = req.body;
        const invoice = await Invoice_1.default.findById(id)
            .populate('tenantId', 'name email')
            .populate('organizationId', 'name')
            .lean();
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        const recipientEmail = email || invoice.tenantId?.email;
        if (!recipientEmail) {
            return res.status(400).json({ success: false, message: 'Email address required' });
        }
        const emailSubject = subject || `Invoice #${invoice.invoiceNumber} from ${invoice.organizationId?.name}`;
        const emailMessage = message || `Dear ${invoice.tenantId?.name},\n\nPlease find your invoice #${invoice.invoiceNumber} for $${invoice.amount}.\n\nThank you!\n\nPowered by HNV Property Management Solutions`;
        const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
        const pdfBuffer = [];
        doc.on('data', (chunk) => pdfBuffer.push(chunk));
        doc.on('end', () => {
            const pdfData = Buffer.concat(pdfBuffer);
            res.status(200).json({
                success: true,
                data: {
                    to: recipientEmail,
                    subject: emailSubject,
                    message: emailMessage,
                    attachment: {
                        filename: `invoice-${invoice.invoiceNumber}.pdf`,
                        content: pdfData.toString('base64'),
                        contentType: 'application/pdf'
                    },
                    textInvoice: generateThermalReceipt(invoice)
                }
            });
        });
        generatePDFInvoice(doc, invoice);
        doc.end();
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.sendEmailInvoice = sendEmailInvoice;
