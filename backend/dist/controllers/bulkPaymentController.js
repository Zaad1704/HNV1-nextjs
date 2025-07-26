"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkWhatsAppNotices = exports.createBulkPayments = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const whatsAppService_1 = __importDefault(require("../services/whatsAppService"));
const createBulkPayments = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { payments, month, generateReceipts = false } = req.body;
        if (!payments || !Array.isArray(payments) || payments.length === 0) {
            return res.status(400).json({ success: false, message: 'Valid payments array required' });
        }
        const createdPayments = [];
        const createdInvoices = [];
        const createdReceipts = [];
        for (const paymentData of payments) {
            const { tenantId, propertyId, amount, originalAmount, discount, paymentDate, paymentMethod, description, status = 'Paid', handwrittenReceiptNumber } = paymentData;
            if (!tenantId || !amount) {
                continue;
            }
            const tenant = await Tenant_1.default.findById(tenantId);
            if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
                continue;
            }
            const payment = await Payment_1.default.create({
                tenantId,
                propertyId: propertyId || tenant.propertyId,
                amount,
                originalAmount: originalAmount || amount,
                discount: discount ? {
                    type: discount.type,
                    value: discount.value,
                    amount: discount.amount
                } : undefined,
                paymentDate,
                paymentMethod: paymentMethod || 'Bank Transfer',
                description: description || `Monthly Rent Payment - ${month || new Date().toISOString().slice(0, 7)}`,
                status,
                organizationId: req.user.organizationId,
                recordedBy: req.user._id,
                notes: discount ? `Applied ${discount.type} discount: ${discount.type === 'percentage' ? discount.value + '%' : '$' + discount.value}` : undefined,
                rentMonth: month
            });
            const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${Date.now()}-${createdInvoices.length + 1}`;
            const invoice = await Invoice_1.default.create({
                tenantId,
                propertyId: tenant.propertyId,
                organizationId: req.user.organizationId,
                invoiceNumber,
                amount,
                dueDate: paymentDate,
                status: status === 'Paid' ? 'paid' : 'pending',
                lineItems: [{
                        description: `Bulk Payment - ${new Date(paymentDate).toLocaleDateString()}`,
                        amount
                    }],
                paidAt: status === 'Paid' ? paymentDate : undefined,
                transactionId: payment._id.toString()
            });
            createdPayments.push(payment);
            createdInvoices.push(invoice);
            if (generateReceipts) {
                const Receipt = require('../models/Receipt').default;
                const Property = require('../models/Property').default;
                const property = await Property.findById(tenant.propertyId);
                const receipt = await Receipt.create({
                    tenantId,
                    propertyId: tenant.propertyId,
                    organizationId: req.user.organizationId,
                    paymentId: payment._id,
                    receiptNumber: `RCP-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${Date.now()}-${createdReceipts.length + 1}`,
                    handwrittenReceiptNumber: handwrittenReceiptNumber || null,
                    amount,
                    paymentDate,
                    paymentMethod,
                    rentMonth: month,
                    tenantName: tenant.name,
                    propertyName: property?.name || 'Property',
                    unitNumber: tenant.unit
                });
                createdReceipts.push(receipt);
            }
        }
        res.status(201).json({
            success: true,
            data: {
                payments: createdPayments,
                invoices: createdInvoices,
                receipts: createdReceipts,
                count: createdPayments.length
            }
        });
    }
    catch (error) {
        console.error('Bulk payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};
exports.createBulkPayments = createBulkPayments;
const sendBulkWhatsAppNotices = async (req, res) => {
    try {
        const { tenantIds, messageType, customMessage } = req.body;
        if (!tenantIds || !Array.isArray(tenantIds)) {
            return res.status(400).json({ success: false, message: 'Tenant IDs array required' });
        }
        const tenants = await Tenant_1.default.find({
            _id: { $in: tenantIds },
            organizationId: req.user.organizationId
        }).populate('organizationId', 'name');
        const whatsappUrls = [];
        for (const tenant of tenants) {
            if (!tenant.phone)
                continue;
            let message = customMessage;
            if (!message) {
                switch (messageType) {
                    case 'reminder':
                        message = whatsAppService_1.default.generateReminderMessage(tenant.name, tenant.rentAmount || 0, 'end of month', tenant.organizationId?.name || 'Property Management');
                        break;
                    case 'notice':
                        message = `Hi ${tenant.name}! This is an important notice from ${tenant.organizationId?.name || 'Property Management'}. Please contact us for more details. Powered by HNV Property Management Solutions`;
                        break;
                    default:
                        message = `Hi ${tenant.name}! Message from ${tenant.organizationId?.name || 'Property Management'}. Powered by HNV Property Management Solutions`;
                }
            }
            const whatsappUrl = whatsAppService_1.default.generateWhatsAppUrl(tenant.phone, message);
            whatsappUrls.push({
                tenantId: tenant._id,
                tenantName: tenant.name,
                phone: tenant.phone,
                whatsappUrl,
                message
            });
        }
        res.status(200).json({
            success: true,
            data: whatsappUrls
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.sendBulkWhatsAppNotices = sendBulkWhatsAppNotices;
