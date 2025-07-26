import { Request, Response } from 'express';
import UnitHistory from '../models/UnitHistory';
import TenantMovement from '../models/TenantMovement';
import Unit from '../models/Unit';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import { IUser } from '../models/User';

// Get unit history
export const getUnitHistory = async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const { limit = 50 } = req.query;

    const history = await UnitHistory.find({
      unitId,
      organizationId: (req.user as IUser)?.organizationId
    })
    .populate('previousData.tenantId', 'name email')
    .populate('newData.tenantId', 'name email')
    .populate('triggeredBy', 'name email')
    .sort({ eventDate: -1 })
    .limit(Number(limit));

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unit history' });
  }
};

// Get tenant movement history
export const getTenantMovementHistory = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { limit = 20 } = req.query;

    const movements = await TenantMovement.find({
      tenantId,
      organizationId: (req.user as IUser)?.organizationId
    })
    .populate('processedBy', 'name email')
    .sort({ movementDate: -1 })
    .limit(Number(limit));

    res.json({ success: true, data: movements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tenant movement history' });
  }
};

// Process tenant transfer
export const processTenantTransfer = async (req: Request, res: Response) => {
  try {
    const { tenantId, fromUnitId, toUnitId, transferDate, reason, notes } = req.body;
    const organizationId = (req.user as IUser)?.organizationId;

    // Get tenant and units
    const [tenant, fromUnit, toUnit] = await Promise.all([
      Tenant.findById(tenantId),
      Unit.findById(fromUnitId).populate('propertyId', 'name'),
      Unit.findById(toUnitId).populate('propertyId', 'name')
    ]);

    if (!tenant || !fromUnit || !toUnit) {
      return res.status(404).json({ success: false, message: 'Tenant or units not found' });
    }

    // Create movement record
    const movement = new TenantMovement({
      tenantId,
      organizationId,
      movementType: 'transfer',
      movementDate: new Date(transferDate),
      fromProperty: {
        propertyId: (fromUnit.propertyId as any)._id,
        propertyName: (fromUnit.propertyId as any).name,
        unitId: fromUnit._id,
        unitNumber: fromUnit.unitNumber,
        unitNickname: fromUnit.nickname
      },
      toProperty: {
        propertyId: (toUnit.propertyId as any)._id,
        propertyName: (toUnit.propertyId as any).name,
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
      processedBy: (req.user as IUser)?._id
    });

    await movement.save();

    // Update units and tenant
    await Promise.all([
      // Update from unit
      Unit.findByIdAndUpdate(fromUnitId, {
        status: 'Available',
        tenantId: null,
        'historyTracking.lastVacatedDate': new Date(transferDate)
      }),
      // Update to unit
      Unit.findByIdAndUpdate(toUnitId, {
        status: 'Occupied',
        tenantId: tenant._id,
        'historyTracking.lastOccupiedDate': new Date(transferDate)
      }),
      // Update tenant
      Tenant.findByIdAndUpdate(tenantId, {
        propertyId: (toUnit.propertyId as any)._id,
        unit: toUnit.unitNumber,
        unitNickname: toUnit.nickname,
        rentAmount: toUnit.rentAmount || tenant.rentAmount
      })
    ]);

    // Create unit history records
    await Promise.all([
      // From unit history
      new UnitHistory({
        unitId: fromUnitId,
        propertyId: (fromUnit.propertyId as any)._id,
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
        triggeredBy: (req.user as IUser)?._id
      }).save(),
      // To unit history
      new UnitHistory({
        unitId: toUnitId,
        propertyId: (toUnit.propertyId as any)._id,
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
        triggeredBy: (req.user as IUser)?._id
      }).save()
    ]);

    res.json({ success: true, data: movement, message: 'Tenant transfer processed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process tenant transfer' });
  }
};

// Get property analytics with cross-data
export const getPropertyCrossAnalytics = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const organizationId = (req.user as IUser)?.organizationId;

    const [
      units,
      tenantMovements,
      unitHistories
    ] = await Promise.all([
      Unit.find({ propertyId, organizationId }).populate('tenantId', 'name email status'),
      TenantMovement.find({
        $or: [
          { 'fromProperty.propertyId': propertyId },
          { 'toProperty.propertyId': propertyId }
        ],
        organizationId
      }).sort({ movementDate: -1 }).limit(20),
      UnitHistory.find({ propertyId, organizationId })
        .sort({ eventDate: -1 })
        .limit(50)
    ]);

    // Calculate analytics
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch property analytics' });
  }
};

// Get tenant journey across properties
export const getTenantJourney = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const organizationId = (req.user as IUser)?.organizationId;

    const [tenant, movements, currentUnit] = await Promise.all([
      Tenant.findById(tenantId),
      TenantMovement.find({ tenantId, organizationId })
        .sort({ movementDate: 1 }),
      Unit.findOne({ tenantId, organizationId })
        .populate('propertyId', 'name address')
    ]);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Build journey timeline
    const journey = movements.map(movement => ({
      date: movement.movementDate,
      type: movement.movementType,
      from: movement.fromProperty,
      to: movement.toProperty,
      rentChange: movement.rentChange,
      reason: movement.reason,
      notes: movement.notes
    }));

    // Add current status
    if (currentUnit) {
      (journey as any).push({
        date: new Date(),
        type: 'current',
        to: {
          propertyId: (currentUnit.propertyId as any)._id,
          propertyName: (currentUnit.propertyId as any).name,
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tenant journey' });
  }
};

// Track unit change (middleware function)
export const trackUnitChange = async (unitId: string, eventType: string, previousData: any, newData: any, triggeredBy?: string, organizationId?: string) => {
  try {
    const unit = await Unit.findById(unitId).populate('propertyId');
    if (!unit) return;

    await new UnitHistory({
      unitId,
      propertyId: unit.propertyId,
      organizationId: organizationId || unit.organizationId,
      eventType,
      eventDate: new Date(),
      previousData,
      newData,
      triggeredBy
    }).save();
  } catch (error) {
    console.error('Failed to track unit change:', error);
  }
};