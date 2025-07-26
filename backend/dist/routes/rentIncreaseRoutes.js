"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/', async (req, res) => {
    try {
        const { type, propertyId, tenantId, increaseType, amount, percentage, effectiveDate, reason } = req.body;
        if (type === 'property' && propertyId) {
            const tenants = await Tenant_1.default.find({ propertyId, status: 'Active' });
            for (const tenant of tenants) {
                const currentRent = tenant.rentAmount || 0;
                const newRent = increaseType === 'percentage'
                    ? currentRent * (1 + percentage / 100)
                    : currentRent + amount;
                await Tenant_1.default.findByIdAndUpdate(tenant._id, {
                    rentAmount: Math.round(newRent * 100) / 100,
                    lastRentIncrease: {
                        date: new Date(effectiveDate),
                        oldAmount: currentRent,
                        newAmount: Math.round(newRent * 100) / 100,
                        type: increaseType,
                        value: increaseType === 'percentage' ? percentage : amount,
                        reason
                    }
                });
            }
            const property = await Property_1.default.findById(propertyId);
            if (property) {
                const currentPropertyRent = property.rentAmount || 0;
                const newPropertyRent = increaseType === 'percentage'
                    ? currentPropertyRent * (1 + percentage / 100)
                    : currentPropertyRent + amount;
                await Property_1.default.findByIdAndUpdate(propertyId, {
                    rentAmount: Math.round(newPropertyRent * 100) / 100
                });
            }
        }
        else if (type === 'tenant' && tenantId) {
            const tenant = await Tenant_1.default.findById(tenantId);
            if (tenant) {
                const currentRent = tenant.rentAmount || 0;
                const newRent = increaseType === 'percentage'
                    ? currentRent * (1 + percentage / 100)
                    : currentRent + amount;
                await Tenant_1.default.findByIdAndUpdate(tenantId, {
                    rentAmount: Math.round(newRent * 100) / 100,
                    lastRentIncrease: {
                        date: new Date(effectiveDate),
                        oldAmount: currentRent,
                        newAmount: Math.round(newRent * 100) / 100,
                        type: increaseType,
                        value: increaseType === 'percentage' ? percentage : amount,
                        reason
                    }
                });
            }
        }
        res.status(200).json({
            success: true,
            message: 'Rent increase applied successfully'
        });
    }
    catch (error) {
        console.error('Rent increase error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
