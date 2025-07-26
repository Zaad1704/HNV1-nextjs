"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackUnitChange = exports.getTenantJourney = exports.getPropertyCrossAnalytics = exports.processTenantTransfer = exports.getTenantMovementHistory = exports.getUnitHistory = void 0;
const UnitHistory_1 = __importDefault(require("../models/UnitHistory"));
const TenantMovement_1 = __importDefault(require("../models/TenantMovement"));
const Unit_1 = __importDefault(require("../models/Unit"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const getUnitHistory = async (req, res) => {
    try {
        const { unitId } = req.params;
        const { limit = 50 } = req.query;
        const history = await UnitHistory_1.default.find({
            unitId,
            organizationId: req.user?.organizationId
        })
            .populate('previousData.tenantId', 'name email')
            .populate('newData.tenantId', 'name email')
            .populate('triggeredBy', 'name email')
            .sort({ eventDate: -1 })
            .limit(Number(limit));
        res.json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch unit history' });
    }
};
exports.getUnitHistory = getUnitHistory;
const getTenantMovementHistory = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { limit = 20 } = req.query;
        const movements = await TenantMovement_1.default.find({
            tenantId,
            organizationId: req.user?.organizationId
        })
            .populate('processedBy', 'name email')
            .sort({ movementDate: -1 })
            .limit(Number(limit));
        res.json({ success: true, data: movements });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tenant movement history' });
    }
};
exports.getTenantMovementHistory = getTenantMovementHistory;
const processTenantTransfer = async (req, res) => {
    try {
        const { tenantId, fromUnitId, toUnitId, transferDate, reason, notes } = req.body;
        const organizationId = req.user?.organizationId;
        const [tenant, fromUnit, toUnit] = await Promise.all([
            Tenant_1.default.findById(tenantId),
            Unit_1.default.findById(fromUnitId).populate('propertyId', 'name'),
            Unit_1.default.findById(toUnitId).populate('propertyId', 'name')
        ]);
        if (!tenant || !fromUnit || !toUnit) {
            return res.status(404).json({ success: false, message: 'Tenant or units not found' });
        }
        const movement = new TenantMovement_1.default({
            tenantId,
            organizationId,
            movementType: 'transfer',
            movementDate: new Date(transferDate),
            fromProperty: {
                propertyId: fromUnit.propertyId._id,
                propertyName: fromUnit.propertyId.name,
                unitId: fromUnit._id,
                unitNumber: fromUnit.unitNumber,
                unitNickname: fromUnit.nickname
            },
            toProperty: {
                propertyId: toUnit.propertyId._id,
                propertyName: toUnit.propertyId.name,
                unitId: toUnit._id,
                unitNumber: toUnit.unitNumber,
                unitNickname: toUnit.nickname
            },
            rentChange: {
                oldRent: tenant.rentAmount,
                newRent: toUnit.rentAmount || tenant.rentAmount,
                changeAmount: (toUnit.rentAmount || tenant.rentAmount) - tenant.rentAmount,
                changePercentage: ((toUnit.rentAmount || tenant.rentAmount) - tenant.rentAmount) / tenant.rentAmount * 100
            },
            reason,
            notes,
            processedBy: req.user?._id
        });
        await movement.save();
        await Promise.all([
            Unit_1.default.findByIdAndUpdate(fromUnitId, {
                status: 'Available',
                tenantId: null,
                'historyTracking.lastVacatedDate': new Date(transferDate)
            }),
            Unit_1.default.findByIdAndUpdate(toUnitId, {
                status: 'Occupied',
                tenantId: tenant._id,
                'historyTracking.lastOccupiedDate': new Date(transferDate)
            }),
            Tenant_1.default.findByIdAndUpdate(tenantId, {
                propertyId: toUnit.propertyId._id,
                unit: toUnit.unitNumber,
                unitNickname: toUnit.nickname,
                rentAmount: toUnit.rentAmount || tenant.rentAmount
            })
        ]);
        await Promise.all([
            new UnitHistory_1.default({
                unitId: fromUnitId,
                propertyId: fromUnit.propertyId._id,
                organizationId,
                eventType: 'tenant_moved_out',
                eventDate: new Date(transferDate),
                previousData: {
                    tenantId: tenant._id,
                    tenantName: tenant.name,
                    status: 'Occupied'
                },
                newData: {
                    status: 'Available'
                },
                notes: `Tenant transferred to ${toUnit.unitNumber}`,
                triggeredBy: req.user?._id
            }).save(),
            new UnitHistory_1.default({
                unitId: toUnitId,
                propertyId: toUnit.propertyId._id,
                organizationId,
                eventType: 'tenant_moved_in',
                eventDate: new Date(transferDate),
                previousData: {
                    status: 'Available'
                },
                newData: {
                    tenantId: tenant._id,
                    tenantName: tenant.name,
                    status: 'Occupied'
                },
                notes: `Tenant transferred from ${fromUnit.unitNumber}`,
                triggeredBy: req.user?._id
            }).save()
        ]);
        res.json({ success: true, data: movement, message: 'Tenant transfer processed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to process tenant transfer' });
    }
};
exports.processTenantTransfer = processTenantTransfer;
const getPropertyCrossAnalytics = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const organizationId = req.user?.organizationId;
        const [units, tenantMovements, unitHistories] = await Promise.all([
            Unit_1.default.find({ propertyId, organizationId }).populate('tenantId', 'name email status'),
            TenantMovement_1.default.find({
                $or: [
                    { 'fromProperty.propertyId': propertyId },
                    { 'toProperty.propertyId': propertyId }
                ],
                organizationId
            }).sort({ movementDate: -1 }).limit(20),
            UnitHistory_1.default.find({ propertyId, organizationId })
                .sort({ eventDate: -1 })
                .limit(50)
        ]);
        const totalUnits = units.length;
        const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
        const avgStayDuration = units.reduce((sum, unit) => sum + unit.historyTracking.averageStayDuration, 0) / totalUnits;
        const totalTenantTurnover = units.reduce((sum, unit) => sum + unit.historyTracking.totalTenants, 0);
        const recentMovements = tenantMovements.slice(0, 10);
        const moveInCount = tenantMovements.filter(m => m.movementType === 'move_in').length;
        const moveOutCount = tenantMovements.filter(m => m.movementType === 'move_out').length;
        const transferCount = tenantMovements.filter(m => m.movementType === 'transfer').length;
        res.json({
            success: true,
            data: {
                propertyStats: {
                    totalUnits,
                    occupiedUnits,
                    occupancyRate,
                    avgStayDuration,
                    totalTenantTurnover
                },
                movementStats: {
                    moveInCount,
                    moveOutCount,
                    transferCount,
                    recentMovements
                },
                recentHistory: unitHistories.slice(0, 20)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch property analytics' });
    }
};
exports.getPropertyCrossAnalytics = getPropertyCrossAnalytics;
const getTenantJourney = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const organizationId = req.user?.organizationId;
        const [tenant, movements, currentUnit] = await Promise.all([
            Tenant_1.default.findById(tenantId),
            TenantMovement_1.default.find({ tenantId, organizationId })
                .sort({ movementDate: 1 }),
            Unit_1.default.findOne({ tenantId, organizationId })
                .populate('propertyId', 'name address')
        ]);
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const journey = movements.map(movement => ({
            date: movement.movementDate,
            type: movement.movementType,
            from: movement.fromProperty,
            to: movement.toProperty,
            rentChange: movement.rentChange,
            reason: movement.reason,
            notes: movement.notes
        }));
        if (currentUnit) {
            journey.push({
                date: new Date(),
                type: 'current',
                to: {
                    propertyId: currentUnit.propertyId._id,
                    propertyName: currentUnit.propertyId.name,
                    unitId: currentUnit._id,
                    unitNumber: currentUnit.unitNumber,
                    unitNickname: currentUnit.nickname
                },
                rentChange: {
                    oldRent: 0,
                    newRent: tenant.rentAmount,
                    changeAmount: 0,
                    changePercentage: 0
                }
            });
        }
        res.json({
            success: true,
            data: {
                tenant: {
                    id: tenant._id,
                    name: tenant.name,
                    email: tenant.email,
                    status: tenant.status
                },
                journey,
                stats: {
                    totalMoves: movements.length,
                    propertiesLived: [...new Set(movements.map(m => m.fromProperty?.propertyId || m.toProperty?.propertyId))].length,
                    avgRentIncrease: movements
                        .filter(m => m.rentChange?.changeAmount > 0)
                        .reduce((sum, m) => sum + (m.rentChange?.changePercentage || 0), 0) / movements.length || 0
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tenant journey' });
    }
};
exports.getTenantJourney = getTenantJourney;
const trackUnitChange = async (unitId, eventType, previousData, newData, triggeredBy, organizationId) => {
    try {
        const unit = await Unit_1.default.findById(unitId).populate('propertyId');
        if (!unit)
            return;
        await new UnitHistory_1.default({
            unitId,
            propertyId: unit.propertyId,
            organizationId: organizationId || unit.organizationId,
            eventType,
            eventDate: new Date(),
            previousData,
            newData,
            triggeredBy
        }).save();
    }
    catch (error) {
        console.error('Failed to track unit change:', error);
    }
};
exports.trackUnitChange = trackUnitChange;
