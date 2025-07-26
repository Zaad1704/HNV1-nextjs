import { Request, Response } from 'express';
import Unit from '../models/Unit';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

// Get units for a property
export const getUnits = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;
    const { status, includeArchived = 'false' } = req.query;
    
    // Verify property access
    const Property = require('../models/Property').default;
    const property = await Property.findById(propertyId);
    
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only view units for properties they manage' });
      return;
    }

    let query: any = { 
      propertyId, 
      organizationId: user.organizationId
    };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Exclude archived units unless specifically requested
    if (includeArchived !== 'true') {
      query.status = { ...query.status, $ne: 'Archived' };
    }
    
    const units = await Unit.find(query)
      .populate('tenantId', 'name email phone status rentAmount leaseStartDate leaseEndDate')
      .sort({ unitNumber: 1 })
      .lean();
    
    // Enhance units with additional information
    const enhancedUnits = units.map(unit => ({
      ...unit,
      displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber,
      isOccupied: unit.status === 'Occupied' && !!unit.tenantId,
      currentRent: unit.historyTracking?.rentHistory?.length > 0 
        ? unit.historyTracking.rentHistory[unit.historyTracking.rentHistory.length - 1].amount
        : unit.rentAmount || 0
    }));
    
    res.json({ 
      success: true, 
      data: enhancedUnits,
      summary: {
        total: enhancedUnits.length,
        available: enhancedUnits.filter(u => u.status === 'Available').length,
        occupied: enhancedUnits.filter(u => u.status === 'Occupied').length,
        maintenance: enhancedUnits.filter(u => u.status === 'Maintenance').length,
        reserved: enhancedUnits.filter(u => u.status === 'Reserved').length
      }
    });
  } catch (error: any) {
    console.error('Get units error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch units',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update unit details
export const updateUnit = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { unitId } = req.params;
    const updates = req.body;
    
    // Find the unit and verify access
    const unit = await Unit.findById(unitId);
    if (!unit || unit.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }

    // Verify property access for agents
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const property = await Property.findById(unit.propertyId);
      
      if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
        res.status(403).json({ success: false, message: 'Agents can only update units for properties they manage' });
        return;
      }
    }
    
    // Validate updates
    const allowedUpdates = [
      'nickname', 'alternativeName', 'floor', 'description', 'rentAmount',
      'size', 'bedrooms', 'bathrooms', 'amenities', 'status'
    ];
    
    const filteredUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // Special handling for status changes
    if (filteredUpdates.status && filteredUpdates.status !== unit.status) {
      // Validate status transitions
      const validTransitions: { [key: string]: string[] } = {
        'Available': ['Occupied', 'Maintenance', 'Reserved'],
        'Occupied': ['Available', 'Maintenance'],
        'Maintenance': ['Available', 'Occupied'],
        'Reserved': ['Available', 'Occupied']
      };
      
      if (!validTransitions[unit.status]?.includes(filteredUpdates.status)) {
        res.status(400).json({ 
          success: false, 
          message: `Cannot change status from ${unit.status} to ${filteredUpdates.status}` 
        });
        return;
      }
    }
    
    const updatedUnit = await Unit.findByIdAndUpdate(
      unitId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).populate('tenantId', 'name email phone status rentAmount');
    
    if (!updatedUnit) {
      res.status(404).json({ success: false, message: 'Unit not found after update' });
      return;
    }
    
    res.json({ 
      success: true, 
      data: {
        ...updatedUnit.toObject(),
        displayName: updatedUnit.nickname 
          ? `${updatedUnit.unitNumber} (${updatedUnit.nickname})` 
          : updatedUnit.unitNumber
      },
      message: 'Unit updated successfully'
    });
  } catch (error: any) {
    console.error('Update unit error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update unit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update unit nickname (legacy endpoint)
export const updateUnitNickname = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { unitId } = req.params;
    const { nickname, alternativeName } = req.body;
    
    const unit = await Unit.findOneAndUpdate(
      { _id: unitId, organizationId: user.organizationId },
      { nickname, alternativeName },
      { new: true, runValidators: true }
    ).populate('tenantId', 'name email status');
    
    if (!unit) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }
    
    res.json({ 
      success: true, 
      data: {
        ...unit.toObject(),
        displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber
      },
      message: 'Unit nickname updated successfully'
    });
  } catch (error: any) {
    console.error('Update unit nickname error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update unit nickname',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create units for property
export const createUnitsForProperty = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;
    const { units } = req.body;
    
    if (!units || !Array.isArray(units) || units.length === 0) {
      res.status(400).json({ success: false, message: 'Units array is required' });
      return;
    }
    
    const property = await Property.findOne({ 
      _id: propertyId, 
      organizationId: user.organizationId 
    });
    
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only create units for properties they manage' });
      return;
    }
    
    // Validate and prepare unit documents
    const unitDocs = units.map((unit: any, index: number) => {
      if (!unit.unitNumber) {
        throw new Error(`Unit ${index + 1} is missing unit number`);
      }
      
      return {
        propertyId,
        organizationId: user.organizationId,
        unitNumber: unit.unitNumber.toString(),
        nickname: unit.nickname || '',
        alternativeName: unit.alternativeName || '',
        floor: unit.floor || '',
        description: unit.description || '',
        rentAmount: parseFloat(unit.rentAmount) || property.rentAmount || 0,
        size: unit.size ? parseFloat(unit.size) : undefined,
        bedrooms: parseInt(unit.bedrooms) || 1,
        bathrooms: parseFloat(unit.bathrooms) || 1,
        amenities: Array.isArray(unit.amenities) ? unit.amenities : [],
        status: unit.status || 'Available'
      };
    });
    
    // Check for duplicate unit numbers
    const unitNumbers = unitDocs.map(u => u.unitNumber);
    const duplicates = unitNumbers.filter((num, index) => unitNumbers.indexOf(num) !== index);
    
    if (duplicates.length > 0) {
      res.status(400).json({ 
        success: false, 
        message: `Duplicate unit numbers found: ${duplicates.join(', ')}` 
      });
      return;
    }
    
    // Check for existing units with same numbers
    const existingUnits = await Unit.find({
      propertyId,
      unitNumber: { $in: unitNumbers }
    });
    
    if (existingUnits.length > 0) {
      const existingNumbers = existingUnits.map(u => u.unitNumber);
      res.status(400).json({ 
        success: false, 
        message: `Units already exist with numbers: ${existingNumbers.join(', ')}` 
      });
      return;
    }
    
    const createdUnits = await Unit.insertMany(unitDocs);
    
    // Update property's numberOfUnits if needed
    const totalUnits = await Unit.countDocuments({ propertyId });
    if (totalUnits > property.numberOfUnits) {
      await Property.findByIdAndUpdate(propertyId, { numberOfUnits: totalUnits });
    }
    
    res.status(201).json({ 
      success: true, 
      data: createdUnits.map(unit => ({
        ...unit.toObject(),
        displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber
      })),
      message: `${createdUnits.length} units created successfully`
    });
  } catch (error: any) {
    console.error('Create units error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }
    
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        message: 'Duplicate unit number detected' 
      });
      return;
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create units',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk update units
export const bulkUpdateUnits = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ success: false, message: 'Updates array is required' });
      return;
    }
    
    const results = [];
    const errors = [];
    
    for (const update of updates) {
      try {
        if (!update.unitId) {
          errors.push({ unitId: update.unitId, error: 'Unit ID is required' });
          continue;
        }
        
        const unit = await Unit.findOne({
          _id: update.unitId,
          organizationId: user.organizationId
        });
        
        if (!unit) {
          errors.push({ unitId: update.unitId, error: 'Unit not found' });
          continue;
        }
        
        // Check agent permissions
        if (user.role === 'Agent') {
          const Property = require('../models/Property').default;
          const property = await Property.findById(unit.propertyId);
          
          if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
            errors.push({ unitId: update.unitId, error: 'Not authorized to update this unit' });
            continue;
          }
        }
        
        // Prepare updates
        const allowedFields = [
          'nickname', 'alternativeName', 'floor', 'description', 
          'rentAmount', 'size', 'bedrooms', 'bathrooms', 'amenities'
        ];
        
        const filteredUpdate: any = {};
        allowedFields.forEach(field => {
          if (update[field] !== undefined) {
            filteredUpdate[field] = update[field];
          }
        });
        
        const updatedUnit = await Unit.findByIdAndUpdate(
          update.unitId,
          filteredUpdate,
          { new: true, runValidators: true }
        );
        
        if (updatedUnit) {
          results.push({
            unitId: update.unitId,
            unitNumber: updatedUnit.unitNumber,
            displayName: updatedUnit.nickname 
              ? `${updatedUnit.unitNumber} (${updatedUnit.nickname})` 
              : updatedUnit.unitNumber,
            success: true
          });
        }
      } catch (error: any) {
        errors.push({ 
          unitId: update.unitId, 
          error: error.message || 'Failed to update unit' 
        });
      }
    }
    
    res.json({ 
      success: errors.length === 0, 
      data: {
        updated: results,
        errors: errors,
        summary: {
          total: updates.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `${results.length} units updated successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
  } catch (error: any) {
    console.error('Bulk update units error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update units',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk update unit nicknames (legacy endpoint)
export const bulkUpdateUnitNicknames = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates)) {
      res.status(400).json({ success: false, message: 'Updates array is required' });
      return;
    }
    
    const bulkOps = updates.map((update: any) => ({
      updateOne: {
        filter: { _id: update.unitId, organizationId: user.organizationId },
        update: { 
          nickname: update.nickname || '', 
          alternativeName: update.alternativeName || ''
        }
      }
    }));
    
    const result = await Unit.bulkWrite(bulkOps);
    
    res.json({ 
      success: true, 
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message: `${result.modifiedCount} units updated successfully`
    });
  } catch (error: any) {
    console.error('Bulk update unit nicknames error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update unit nicknames',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get vacant units for a property
export const getVacantUnits = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;
    
    // Verify property access
    const Property = require('../models/Property').default;
    const property = await Property.findById(propertyId);
    
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only view units for properties they manage' });
      return;
    }
    
    const units = await Unit.find({ 
      propertyId, 
      organizationId: user.organizationId,
      status: 'Available',
      $or: [
        { tenantId: { $exists: false } },
        { tenantId: null }
      ]
    }).sort({ unitNumber: 1 }).lean();
    
    const enhancedUnits = units.map(unit => ({
      ...unit,
      displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber
    }));
    
    res.json({ 
      success: true, 
      data: enhancedUnits,
      count: enhancedUnits.length
    });
  } catch (error: any) {
    console.error('Get vacant units error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch vacant units',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search units by number or nickname
export const searchUnits = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { q, propertyId, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 1) {
      res.status(400).json({ success: false, message: 'Search query is required' });
      return;
    }
    
    const filter: any = {
      organizationId: user.organizationId,
      status: { $ne: 'Archived' }
    };
    
    if (propertyId) {
      filter.propertyId = propertyId;
    }
    
    // For agents, only show units from properties they manage
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const managedProperties = await Property.find({
        organizationId: user.organizationId,
        managedByAgentId: user._id
      }).select('_id');
      
      const managedPropertyIds = managedProperties.map(p => p._id);
      filter.propertyId = { $in: managedPropertyIds };
    }
    
    filter.$or = [
      { unitNumber: { $regex: q, $options: 'i' } },
      { nickname: { $regex: q, $options: 'i' } },
      { alternativeName: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
    
    const units = await Unit.find(filter)
      .populate('tenantId', 'name email phone status')
      .populate('propertyId', 'name address')
      .sort({ unitNumber: 1 })
      .limit(Math.min(50, parseInt(limit as string)))
      .lean();
    
    const enhancedUnits = units.map(unit => ({
      ...unit,
      displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber,
      isOccupied: unit.status === 'Occupied' && !!unit.tenantId
    }));
    
    res.json({ 
      success: true, 
      data: enhancedUnits,
      count: enhancedUnits.length
    });
  } catch (error: any) {
    console.error('Search units error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search units',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get unit by ID
export const getUnitById = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { unitId } = req.params;
    
    const unit = await Unit.findOne({
      _id: unitId,
      organizationId: user.organizationId
    })
    .populate('tenantId', 'name email phone status rentAmount leaseStartDate leaseEndDate')
    .populate('propertyId', 'name address')
    .lean();
    
    if (!unit) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const property = await Property.findById(unit.propertyId);
      
      if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
        res.status(403).json({ success: false, message: 'Agents can only view units for properties they manage' });
        return;
      }
    }
    
    const enhancedUnit = {
      ...unit,
      displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber,
      isOccupied: unit.status === 'Occupied' && !!unit.tenantId,
      currentRent: unit.historyTracking?.rentHistory?.length > 0 
        ? unit.historyTracking.rentHistory[unit.historyTracking.rentHistory.length - 1].amount
        : unit.rentAmount || 0
    };
    
    res.json({ success: true, data: enhancedUnit });
  } catch (error: any) {
    console.error('Get unit by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete unit
export const deleteUnit = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { unitId } = req.params;
    
    const unit = await Unit.findOne({
      _id: unitId,
      organizationId: user.organizationId
    });
    
    if (!unit) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const property = await Property.findById(unit.propertyId);
      
      if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
        res.status(403).json({ success: false, message: 'Agents can only delete units for properties they manage' });
        return;
      }
    }
    
    // Check if unit is occupied
    if (unit.status === 'Occupied' || unit.tenantId) {
      res.status(400).json({ 
        success: false, 
        message: 'Cannot delete occupied unit. Please move or remove tenant first.' 
      });
      return;
    }
    
    // Archive instead of delete if unit has history
    if (unit.historyTracking?.totalTenants > 0) {
      await Unit.findByIdAndUpdate(unitId, { status: 'Archived' });
      res.json({ 
        success: true, 
        message: 'Unit archived due to existing history'
      });
    } else {
      await Unit.findByIdAndDelete(unitId);
      res.json({ 
        success: true, 
        message: 'Unit deleted successfully'
      });
    }
  } catch (error: any) {
    console.error('Delete unit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete unit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};