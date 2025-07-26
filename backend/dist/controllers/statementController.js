"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTenantStatement = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const statementGenerator_1 = require("../utils/statementGenerator");
const generateTenantStatement = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { tenantId } = req.params;
        const { format = 'standard', startDate, endDate } = req.query;
        const language = req.user?.language || 'en';
        const tenant = await Tenant_1.default.findById(tenantId)
            .populate('propertyId', 'name address image')
            .populate('organizationId', 'name')
            .lean();
        if (!tenant || tenant.organizationId._id.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const dateFilter = { tenantId, organizationId: req.user.organizationId };
        if (startDate || endDate) {
            dateFilter.paymentDate = {};
            if (startDate)
                dateFilter.paymentDate.$gte = new Date(startDate);
            if (endDate)
                dateFilter.paymentDate.$lte = new Date(endDate);
        }
        const payments = await Payment_1.default.find(dateFilter).sort({ paymentDate: -1 }).lean();
        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="statement-${tenant.name}-${Date.now()}.pdf"`);
            return (0, statementGenerator_1.generateColorfulTenantStatement)({
                tenant,
                payments,
                startDate,
                endDate
            }, res, language);
        }
        if (format === 'thermal') {
            const thermalStatement = (0, statementGenerator_1.generateEnhancedThermalStatement)({
                tenant,
                payments,
                startDate,
                endDate
            });
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="statement-${tenant.name}-${Date.now()}.txt"`);
            return res.send(thermalStatement);
        }
        res.status(200).json({
            success: true,
            data: {
                tenant,
                payments,
                summary: {
                    totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
                    totalPayments: payments.length
                }
            }
        });
    }
    catch (error) {
        console.error('Statement generation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.generateTenantStatement = generateTenantStatement;
