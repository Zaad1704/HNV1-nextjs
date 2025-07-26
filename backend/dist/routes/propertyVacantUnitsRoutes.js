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
router.get('/:propertyId/vacant-units', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const occupiedTenants = await Tenant_1.default.find({
            propertyId,
            status: { $in: ['Active', 'Late'] }
        }).select('unit');
        const occupiedUnits = occupiedTenants.map(t => t.unit);
        const allPreviousTenants = await Tenant_1.default.find({ propertyId })
            .sort({ createdAt: -1 })
            .select('unit rentAmount');
        const vacantUnits = [];
        const totalUnits = property.totalUnits || 10;
        for (let i = 1; i <= totalUnits; i++) {
            const unitNumber = `${i}`;
            if (!occupiedUnits.includes(unitNumber)) {
                const lastTenant = allPreviousTenants.find(t => t.unit === unitNumber);
                vacantUnits.push({
                    unitNumber,
                    lastRentAmount: lastTenant?.rentAmount || null,
                    suggestedRent: property.rentAmount || null
                });
            }
        }
        res.status(200).json({ success: true, data: vacantUnits });
    }
    catch (error) {
        console.error('Get vacant units error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
