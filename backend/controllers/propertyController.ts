import { Request, Response } from 'express';
import Property from '../models/Property';
import Unit from '../models/Unit';
import actionChainService from '../services/actionChainService';
import { checkUsageLimit, updateUsageCount } from '../middleware/subscriptionMiddleware';
import auditService from '../services/auditService';

// Enhanced validation helper
const validatePropertyInput = (data: any) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Property name is required');
  }
  
  if (!data['address[street]'] && !data.address?.street) {
    errors.push('Street address is required');
  }
  
  if (!data['address[city]'] && !data.address?.city) {
    errors.push('City is required');
  }
  
  if (!data['address[state]'] && !data.address?.state) {
    errors.push('State is required');
  }
  
  const numberOfUnits = parseInt(data.numberOfUnits) || 1;
  if (numberOfUnits < 1 || numberOfUnits > 10000) {
    errors.push('Number of units must be between 1 and 10,000');
  }
  
  return {
    error: errors.length > 0 ? { details: errors.map(msg => ({ message: msg })) } : null,
    value: data
  };
};

// Property search endpoint
export const searchProperties = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
      return;
    }

    let query: any = {
      organizationId: user.organizationId,
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'address.street': { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } },
        { 'address.state': { $regex: q, $options: 'i' } },
        { 'address.formattedAddress': { $regex: q, $options: 'i' } }
      ]
    };

    // Agents see only properties they manage
    if (user.role === 'Agent') {
      const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
      const managedPropertyIds = userData?.managedProperties || [];
      query._id = { $in: managedPropertyIds };
    }

    const properties = await Property.find(query)
      .select('name address propertyType numberOfUnits status imageUrl')
      .limit(Math.min(50, parseInt(limit as string)))
      .lean();

    res.status(200).json({
      success: true,
      data: properties.map(p => ({
        _id: p._id,
        name: p.name,
        address: p.address?.formattedAddress || `${p.address?.street}, ${p.address?.city}`,
        propertyType: p.propertyType,
        numberOfUnits: p.numberOfUnits,
        status: p.status,
        imageUrl: p.imageUrl
      }))
    });
  } catch (error: any) {
    console.error('Search properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Enhanced AI Description Generator
const generatePropertyDescription = (property: any): string => {
  const propertyType = property.propertyType?.toLowerCase() || 'property';
  const units = property.numberOfUnits || 1;
  const unitText = units === 1 ? 'unit' : 'units';
  const city = property.address?.city || 'a prime location';
  const street = property.address?.street || 'a desirable street';
  const state = property.address?.state || '';
  const yearBuilt = property.yearBuilt ? ` built in ${property.yearBuilt}` : '';
  const sqft = property.squareFootage ? ` spanning ${property.squareFootage.toLocaleString()} square feet` : '';
  const parking = property.parkingSpaces > 0 ? ` with ${property.parkingSpaces} parking space${property.parkingSpaces > 1 ? 's' : ''}` : '';
  const amenitiesText = property.amenities && property.amenities.length > 0 
    ? ` Features include: ${property.amenities.slice(0, 3).join(', ')}.`
    : '';
  
  const templates = [
    `This ${propertyType}${yearBuilt} offers ${units} ${unitText} in ${city}, ${state}. Located on ${street}${sqft}${parking}, this well-maintained property provides excellent investment potential with modern amenities and convenient access to local attractions.${amenitiesText}`,
    `Discover this exceptional ${propertyType} featuring ${units} residential ${unitText} in ${city}. The property at ${street}${sqft} combines comfort and convenience, making it an ideal choice for both residents and investors seeking quality accommodation.${amenitiesText}`,
    `Welcome to this outstanding ${propertyType} with ${units} ${unitText} situated in ${city}. This strategically located property${sqft}${parking} offers excellent rental potential and is perfect for those looking for a solid investment opportunity in real estate.${amenitiesText}`,
    `Experience premium living at this ${propertyType} boasting ${units} ${unitText} in ${city}. Positioned on ${street}${sqft}, this property combines modern living standards with investment appeal, offering residents comfort and investors strong returns.${amenitiesText}`
  ];
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

// Property statistics helper
const calculatePropertyStats = async (propertyId: string, organizationId: string) => {
  try {
    const [Tenant, Payment, Expense, MaintenanceRequest] = await Promise.all([
      import('../models/Tenant'),
      import('../models/Payment'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest')
    ]);

    const [tenants, payments, expenses, maintenance] = await Promise.all([
      Tenant.default.find({ propertyId, organizationId }).lean(),
      Payment.default.find({ propertyId, organizationId }).lean(),
      Expense.default.find({ propertyId, organizationId }).lean(),
      MaintenanceRequest.default.find({ propertyId, organizationId }).lean()
    ]);

    const activeTenants = tenants.filter(t => t.status === 'Active');
    const totalIncome = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const openMaintenanceRequests = maintenance.filter(m => m.status === 'Open' || m.status === 'In Progress').length;

    return {
      activeTenants: activeTenants.length,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      openMaintenanceRequests,
      occupancyRate: tenants.length > 0 ? (activeTenants.length / tenants.length) * 100 : 0
    };
  } catch (error) {
    console.error('Error calculating property stats:', error);
    return {
      activeTenants: 0,
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      openMaintenanceRequests: 0,
      occupancyRate: 0
    };
  }
};

// Get property summary statistics
export const getPropertySummary = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    let query: any = { 
      organizationId: user.organizationId,
      isActive: true
    };
    
    // Agents see only properties they manage
    if (user.role === 'Agent') {
      const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
      const managedPropertyIds = userData?.managedProperties || [];
      query._id = { $in: managedPropertyIds };
    }

    const properties = await Property.find(query).lean();
    
    const [Tenant, Payment, Expense, MaintenanceRequest] = await Promise.all([
      import('../models/Tenant'),
      import('../models/Payment'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest')
    ]);

    const propertyIds = properties.map(p => p._id);
    
    const [allTenants, allPayments, allExpenses, allMaintenance] = await Promise.all([
      Tenant.default.find({ propertyId: { $in: propertyIds }, organizationId: user.organizationId }).lean(),
      Payment.default.find({ propertyId: { $in: propertyIds }, organizationId: user.organizationId }).lean(),
      Expense.default.find({ propertyId: { $in: propertyIds }, organizationId: user.organizationId }).lean(),
      MaintenanceRequest.default.find({ propertyId: { $in: propertyIds }, organizationId: user.organizationId }).lean()
    ]);

    const activeTenants = allTenants.filter(t => t.status === 'Active');
    const totalUnits = properties.reduce((sum, p) => sum + (p.numberOfUnits || 0), 0);
    const occupiedUnits = activeTenants.length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    const totalIncome = allPayments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netIncome = totalIncome - totalExpenses;
    
    const maintenanceStats = {
      total: allMaintenance.length,
      pending: allMaintenance.filter(m => m.status === 'Open').length,
      inProgress: allMaintenance.filter(m => m.status === 'In Progress').length,
      completed: allMaintenance.filter(m => m.status === 'Completed').length
    };

    // Property type distribution
    const propertyTypeDistribution = properties.reduce((acc: any, p) => {
      const type = p.propertyType || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Status distribution
    const statusDistribution = properties.reduce((acc: any, p) => {
      const status = p.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        properties: {
          total: properties.length,
          active: properties.filter(p => p.status === 'Active').length,
          inactive: properties.filter(p => p.status === 'Inactive').length,
          underRenovation: properties.filter(p => p.status === 'Under Renovation').length,
          archived: properties.filter(p => p.status === 'Archived').length
        },
        units: {
          total: totalUnits,
          occupied: occupiedUnits,
          vacant: vacantUnits,
          occupancyRate: Math.round(occupancyRate)
        },
        financial: {
          totalIncome,
          totalExpenses,
          netIncome,
          profitMargin: totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100) : 0
        },
        maintenance: maintenanceStats,
        distributions: {
          propertyTypes: propertyTypeDistribution,
          statuses: statusDistribution
        }
      }
    });
  } catch (error: any) {
    console.error('Get property summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }
  
  console.log('Create property request:', {
    body: req.body,
    file: req.file ? { filename: req.file.filename, originalname: req.file.originalname } : null
  });

  try {
    // Check usage limit before creating
    const subscriptionService = (await import('../services/subscriptionService')).default;
    const usageCheck = await subscriptionService.checkUsageLimit(user.organizationId, 'properties');
    
    if (!usageCheck.allowed) {
      res.status(403).json({
        success: false,
        message: 'Property limit exceeded',
        reason: usageCheck.reason,
        currentUsage: usageCheck.currentUsage,
        limit: usageCheck.limit
      });
      return;
    }

    // Enhanced input validation
    const { error, value } = validatePropertyInput(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => d.message)
      });
      return;
    }

    // Check for duplicate property names in organization
    const existingProperty = await Property.findOne({
      organizationId: user.organizationId,
      name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') },
      isActive: true
    });
    
    if (existingProperty) {
      res.status(400).json({
        success: false,
        message: 'A property with this name already exists in your organization'
      });
      return;
    }

    // Handle image URL from uploaded file or direct URL
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      try {
        // Use Cloudinary in production, local storage in development
        const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
        if (isCloudinaryConfigured()) {
          imageUrl = await uploadToCloudinary(req.file, 'properties');
          console.log('Image uploaded to Cloudinary:', imageUrl);
        } else {
          imageUrl = `/uploads/images/${req.file.filename}`;
          console.log('Image uploaded locally:', imageUrl);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        // Fallback to local path
        imageUrl = `/uploads/images/${req.file.filename}`;
      }
    }
    
    // Handle nested address object from FormData
    const address = {
      street: req.body['address[street]'] || req.body.address?.street || '',
      city: req.body['address[city]'] || req.body.address?.city || '',
      state: req.body['address[state]'] || req.body.address?.state || '',
      zipCode: req.body['address[zipCode]'] || req.body.address?.zipCode || '',
      country: req.body['address[country]'] || req.body.address?.country || 'United States'
    };
    
    // Validate and parse numberOfUnits
    const numberOfUnits = parseInt(req.body.numberOfUnits) || 1;
    if (numberOfUnits < 1 || numberOfUnits > 10000) {
      res.status(400).json({
        success: false,
        message: 'Number of units must be between 1 and 10,000'
      });
      return;
    }
    
    const propertyData = {
      name: req.body.name.trim(),
      address: address,
      numberOfUnits: numberOfUnits,
      propertyType: req.body.propertyType || 'Apartment',
      status: req.body.status || 'Active',
      imageUrl: imageUrl,
      organizationId: user.organizationId,
      createdBy: user._id,
      managedByAgentId: req.body.managedByAgentId || null,
      rentAmount: parseFloat(req.body.rentAmount) || 0,
      yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : undefined,
      squareFootage: req.body.squareFootage ? parseFloat(req.body.squareFootage) : undefined,
      parkingSpaces: parseInt(req.body.parkingSpaces) || 0,
      petPolicy: req.body.petPolicy || 'Conditional',
      amenities: req.body.amenities ? req.body.amenities.split(',').map((a: string) => a.trim()) : [],
      description: ''
    };
    
    console.log('Property data being created:', propertyData);
    
    // Generate AI description
    propertyData.description = generatePropertyDescription(propertyData);
    
    const property = await Property.create(propertyData);

    // Units will be created automatically by the post-save middleware
    
    // Trigger action chain
    try {
      await actionChainService.onPropertyAdded(property, user._id, user.organizationId);
    } catch (actionError) {
      console.error('Action chain error:', actionError);
      // Don't fail the request if action chain fails
    }
    
    // Update usage count
    try {
      await subscriptionService.updateUsage(user.organizationId, 'properties', 1);
    } catch (usageError) {
      console.error('Usage update error:', usageError);
      // Don't fail the request if usage update fails
    }

    // Populate the response with related data
    const populatedProperty = await Property.findById(property._id)
      .populate('createdBy', 'name email')
      .populate('managedByAgentId', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedProperty,
      message: 'Property created successfully'
    });
  } catch (error: any) {
    console.error('Create property error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'A property with this name already exists in your organization'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      propertyType, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      includeArchived = 'false'
    } = req.query;

    let query: any = { 
      organizationId: user.organizationId,
      isActive: true
    };
    
    // Include archived properties if requested
    if (includeArchived === 'true') {
      delete query.isActive;
    } else {
      query.status = { $ne: 'Archived' };
    }
    
    // Agents see only properties they manage
    if (user.role === 'Agent') {
      const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
      const managedPropertyIds = userData?.managedProperties || [];
      
      query._id = { $in: managedPropertyIds };
    }

    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [properties, totalCount] = await Promise.all([
      Property.find(query)
        .populate('createdBy', 'name email')
        .populate('managedByAgentId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Property.countDocuments(query)
    ]);

    // Calculate occupancy rates for each property
    const Tenant = require('../models/Tenant').default;
    const propertiesWithOccupancy = await Promise.all(
      properties.map(async (property: any) => {
        try {
          const activeTenants = await Tenant.countDocuments({
            propertyId: property._id,
            status: 'Active'
          });
          
          const occupancyRate = property.numberOfUnits > 0 
            ? Math.round((activeTenants / property.numberOfUnits) * 100)
            : 0;
            
          return {
            ...property,
            occupancyRate,
            activeTenants,
            vacantUnits: property.numberOfUnits - activeTenants
          };
        } catch (error) {
          console.error(`Error calculating occupancy for property ${property._id}:`, error);
          return {
            ...property,
            occupancyRate: 0,
            activeTenants: 0,
            vacantUnits: property.numberOfUnits
          };
        }
      })
    );

    res.status(200).json({ 
      success: true, 
      data: propertiesWithOccupancy,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error: any) {
    console.error('Get properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('managedByAgentId', 'name email')
      .lean();
      
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view this property' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only view properties they manage' });
      return;
    }

    // Calculate property statistics
    const stats = await calculatePropertyStats(property._id.toString(), user.organizationId.toString());

    res.status(200).json({ 
      success: true, 
      data: {
        ...property,
        stats
      }
    });
  } catch (error: any) {
    console.error('Get property by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }
  
  console.log('Update property request:', {
    body: req.body,
    file: req.file ? { filename: req.file.filename, originalname: req.file.originalname } : null
  });

  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this property' });
      return;
    }

    // Check if user has permission to update this property
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only update properties they manage' });
      return;
    }

    const updates: any = {};
    
    // Handle basic fields
    if (req.body.name !== undefined) {
      updates.name = req.body.name.trim();
    }
    
    if (req.body.propertyType !== undefined) {
      updates.propertyType = req.body.propertyType;
    }
    
    if (req.body.status !== undefined) {
      updates.status = req.body.status;
    }
    
    if (req.body.numberOfUnits !== undefined) {
      const newNumberOfUnits = parseInt(req.body.numberOfUnits);
      if (newNumberOfUnits < 1 || newNumberOfUnits > 10000) {
        res.status(400).json({
          success: false,
          message: 'Number of units must be between 1 and 10,000'
        });
        return;
      }
      updates.numberOfUnits = newNumberOfUnits;
      
      // Handle unit creation/deletion when numberOfUnits changes
      if (newNumberOfUnits !== property.numberOfUnits) {
        const Unit = require('../models/Unit').default;
        const currentUnits = await Unit.countDocuments({ propertyId: property._id });
        
        if (newNumberOfUnits > currentUnits) {
          // Create additional units
          const unitsToCreate = [];
          for (let i = currentUnits + 1; i <= newNumberOfUnits; i++) {
            unitsToCreate.push({
              propertyId: property._id,
              organizationId: user.organizationId,
              unitNumber: i.toString(),
              status: 'Available',
              rentAmount: property.rentAmount || 0
            });
          }
          await Unit.insertMany(unitsToCreate);
        } else if (newNumberOfUnits < currentUnits) {
          // Mark excess units as maintenance (don't delete to preserve history)
          const Unit = require('../models/Unit').default;
          await Unit.updateMany(
            { 
              propertyId: property._id,
              unitNumber: { $gt: newNumberOfUnits.toString() }
            },
            { status: 'Maintenance' }
          );
        }
      }
    }
    
    // Handle additional fields
    if (req.body.rentAmount !== undefined) {
      updates.rentAmount = parseFloat(req.body.rentAmount) || 0;
    }
    
    if (req.body.yearBuilt !== undefined) {
      updates.yearBuilt = parseInt(req.body.yearBuilt) || undefined;
    }
    
    if (req.body.squareFootage !== undefined) {
      updates.squareFootage = parseFloat(req.body.squareFootage) || undefined;
    }
    
    if (req.body.parkingSpaces !== undefined) {
      updates.parkingSpaces = parseInt(req.body.parkingSpaces) || 0;
    }
    
    if (req.body.petPolicy !== undefined) {
      updates.petPolicy = req.body.petPolicy;
    }
    
    if (req.body.amenities !== undefined) {
      updates.amenities = typeof req.body.amenities === 'string' 
        ? req.body.amenities.split(',').map((a: string) => a.trim())
        : req.body.amenities;
    }
    
    // Handle address updates
    if (req.body['address[street]'] || req.body.address) {
      updates.address = {
        street: req.body['address[street]'] || req.body.address?.street || property.address?.street || '',
        city: req.body['address[city]'] || req.body.address?.city || property.address?.city || '',
        state: req.body['address[state]'] || req.body.address?.state || property.address?.state || '',
        zipCode: req.body['address[zipCode]'] || req.body.address?.zipCode || property.address?.zipCode || '',
        country: req.body['address[country]'] || req.body.address?.country || property.address?.country || 'United States'
      };
    }
    
    // Handle image upload
    if (req.file) {
      try {
        const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
        if (isCloudinaryConfigured()) {
          updates.imageUrl = await uploadToCloudinary(req.file, 'properties');
          console.log('Image uploaded to Cloudinary:', updates.imageUrl);
        } else {
          updates.imageUrl = `/uploads/images/${req.file.filename}`;
          console.log('Image updated locally:', updates.imageUrl);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        updates.imageUrl = `/uploads/images/${req.file.filename}`;
      }
    } else if (req.body.imageUrl !== undefined) {
      updates.imageUrl = req.body.imageUrl;
    }
    
    // Regenerate description if key fields changed
    const shouldRegenerateDescription = 
      updates.name || updates.propertyType || updates.numberOfUnits || updates.address;
      
    if (shouldRegenerateDescription) {
      const updatedPropertyData = { ...property.toObject(), ...updates };
      updates.description = generatePropertyDescription(updatedPropertyData);
    }

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id, 
      updates, 
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email')
     .populate('managedByAgentId', 'name email');

    if (!updatedProperty) {
      res.status(404).json({ success: false, message: 'Property not found after update' });
      return;
    }

    res.status(200).json({ 
      success: true, 
      data: updatedProperty,
      message: 'Property updated successfully'
    });
  } catch (error: any) {
    console.error('Update property error:', error);
    
    // Handle validation errors
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
      message: 'Failed to update property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
      return;
    }

    // Check if user has permission to delete this property
    if (user.role === 'Agent') {
      res.status(403).json({ success: false, message: 'Agents cannot delete properties' });
      return;
    }

    // Enhanced validation before deletion
    const [Tenant, Payment, MaintenanceRequest] = await Promise.all([
      import('../models/Tenant'),
      import('../models/Payment'),
      import('../models/MaintenanceRequest')
    ]);

    const [activeTenants, recentPayments, openMaintenance] = await Promise.all([
      Tenant.default.countDocuments({
        propertyId: property._id,
        status: 'Active'
      }),
      Payment.default.countDocuments({
        propertyId: property._id,
        status: 'Paid',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }),
      MaintenanceRequest.default.countDocuments({
        propertyId: property._id,
        status: { $in: ['Open', 'In Progress'] }
      })
    ]);

    if (activeTenants > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot archive property with ${activeTenants} active tenant(s). Please move or deactivate tenants first.`,
        details: {
          activeTenants,
          recentPayments,
          openMaintenance
        }
      });
      return;
    }

    // Soft delete by archiving with enhanced cascade operations
    const archivedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Archived',
        isActive: false,
        archivedAt: new Date(),
        archivedBy: user._id
      },
      { new: true }
    );

    // Enhanced cascade operations
    const Unit = require('../models/Unit').default;
    const cascadeOperations = [
      Unit.updateMany(
        { propertyId: property._id },
        { 
          status: 'Archived',
          $unset: { tenantId: 1 },
          archivedAt: new Date()
        }
      ),
      Payment.default.updateMany(
        { propertyId: property._id, status: { $ne: 'Paid' } },
        { status: 'Cancelled', cancelledAt: new Date() }
      ),
      MaintenanceRequest.default.updateMany(
        { propertyId: property._id, status: { $in: ['Open', 'In Progress'] } },
        { status: 'Cancelled', cancelledAt: new Date() }
      )
    ];

    await Promise.allSettled(cascadeOperations);

    // Update usage count
    try {
      const subscriptionService = (await import('../services/subscriptionService')).default;
      await subscriptionService.updateUsage(user.organizationId, 'properties', -1);
    } catch (usageError) {
      console.error('Usage update error:', usageError);
    }

    // Log the archival action
    await auditService.logProperty(
      user.organizationId,
      user._id,
      'PROPERTY_ARCHIVED',
      property._id.toString(),
      { status: property.status },
      { 
        status: 'Archived',
        archivedAt: new Date(),
        cascadedItems: {
          units: await Unit.countDocuments({ propertyId: property._id, status: 'Archived' }),
          cancelledPayments: recentPayments,
          cancelledMaintenance: openMaintenance
        }
      }
    );

    res.status(200).json({ 
      success: true, 
      data: archivedProperty,
      message: 'Property archived successfully',
      details: {
        archivedUnits: await Unit.countDocuments({ propertyId: property._id, status: 'Archived' }),
        preservedPayments: await Payment.default.countDocuments({ propertyId: property._id, status: 'Paid' })
      }
    });
  } catch (error: any) {
    console.error('Archive property error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// NEW DATA PREVIEW ENDPOINTS
export const getPropertyDataPreviews = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;
    const { unit } = req.query;

    // Verify property access
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only view data for properties they manage' });
      return;
    }

    const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, Tenant] = await Promise.all([
      import('../models/Payment'),
      import('../models/Receipt'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest'),
      import('../models/Reminder'),
      import('../models/Tenant')
    ]);

    // Base query filters
    let baseQuery: any = { propertyId, organizationId: user.organizationId };
    let tenantQuery: any = { propertyId, organizationId: user.organizationId };
    
    if (unit) {
      const tenant = await Tenant.default.findOne({ propertyId, unit, organizationId: user.organizationId });
      if (tenant) {
        baseQuery.tenantId = tenant._id;
        tenantQuery._id = tenant._id;
      } else {
        baseQuery.tenantId = null;
      }
    }

    const [payments, receipts, expenses, maintenance, reminders] = await Promise.all([
      Payment.default.find(baseQuery)
        .populate('tenantId', 'name unit')
        .sort({ paymentDate: -1 })
        .limit(10)
        .lean(),
      Receipt.default.find(baseQuery)
        .populate('tenantId', 'name unit')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Expense.default.find(unit ? {} : { propertyId, organizationId: user.organizationId })
        .sort({ date: -1 })
        .limit(10)
        .lean(),
      MaintenanceRequest.default.find(baseQuery)
        .populate('tenantId', 'name unit')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Reminder.default.find(unit ? tenantQuery : { propertyId, organizationId: user.organizationId })
        .populate('tenantId', 'name unit')
        .sort({ nextRunDate: 1 })
        .limit(10)
        .lean()
    ]);

    // Calculate summary statistics
    const totalIncome = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const pendingMaintenance = maintenance.filter(m => m.status === 'Open' || m.status === 'In Progress').length;
    const activeReminders = reminders.filter(r => r.status === 'active').length;

    res.status(200).json({
      success: true,
      data: {
        payments: payments.map(p => ({
          _id: p._id,
          amount: p.amount,
          status: p.status,
          paymentDate: p.paymentDate,
          tenant: p.tenantId,
          paymentMethod: p.paymentMethod,
          rentMonth: p.rentMonth
        })),
        receipts: receipts.map(r => ({
          _id: r._id,
          receiptNumber: r.receiptNumber,
          amount: r.amount,
          paymentDate: r.paymentDate,
          tenant: r.tenantId,
          paymentMethod: r.paymentMethod
        })),
        expenses: expenses.map(e => ({
          _id: e._id,
          description: e.description,
          amount: e.amount,
          category: e.category,
          date: e.date
        })),
        maintenance: maintenance.map(m => ({
          _id: m._id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          tenant: m.tenantId,
          assignedTo: m.assignedTo,
          createdAt: m.createdAt
        })),
        reminders: reminders.map(r => ({
          _id: r._id,
          title: r.title,
          type: r.type,
          status: r.status,
          nextRunDate: r.nextRunDate,
          tenant: r.tenantId
        })),
        summary: {
          totalIncome,
          totalExpenses,
          netIncome: totalIncome - totalExpenses,
          pendingMaintenance,
          activeReminders,
          unit: unit || 'All Units'
        }
      }
    });
  } catch (error: any) {
    console.error('Property data previews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property data previews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getUnitData = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId, unitNumber } = req.params;

    // Verify property access
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only view data for properties they manage' });
      return;
    }

    const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, Tenant, Unit] = await Promise.all([
      import('../models/Payment'),
      import('../models/Receipt'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest'),
      import('../models/Reminder'),
      import('../models/Tenant'),
      import('../models/Unit')
    ]);

    // Find unit and tenant information
    const [unit, tenant] = await Promise.all([
      Unit.default.findOne({ 
        propertyId, 
        unitNumber, 
        organizationId: user.organizationId 
      }).lean(),
      Tenant.default.findOne({ 
        propertyId, 
        unit: unitNumber, 
        organizationId: user.organizationId,
        status: 'Active'
      }).lean()
    ]);

    if (!unit) {
      res.status(404).json({ success: false, message: 'Unit not found' });
      return;
    }

    let unitData: any = {
      unit: {
        ...unit,
        displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber,
        isOccupied: !!tenant
      },
      tenant: tenant ? {
        _id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        unit: tenant.unit,
        rentAmount: tenant.rentAmount,
        status: tenant.status,
        leaseStartDate: tenant.leaseStartDate,
        leaseEndDate: tenant.leaseEndDate
      } : null
    };

    if (tenant) {
      // Fetch related data for occupied unit
      const [payments, receipts, maintenance, reminders] = await Promise.all([
        Payment.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
          .sort({ paymentDate: -1 })
          .limit(20)
          .lean(),
        Receipt.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
        MaintenanceRequest.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
          .populate('assignedTo', 'name')
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
        Reminder.default.find({ tenantId: tenant._id, organizationId: user.organizationId })
          .sort({ nextRunDate: 1 })
          .limit(20)
          .lean()
      ]);

      unitData = {
        ...unitData,
        payments: payments.map(p => ({
          _id: p._id,
          amount: p.amount,
          status: p.status,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          rentMonth: p.rentMonth
        })),
        receipts: receipts.map(r => ({
          _id: r._id,
          receiptNumber: r.receiptNumber,
          amount: r.amount,
          paymentDate: r.paymentDate,
          paymentMethod: r.paymentMethod
        })),
        maintenance: maintenance.map(m => ({
          _id: m._id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          assignedTo: m.assignedTo,
          createdAt: m.createdAt
        })),
        reminders: reminders.map(r => ({
          _id: r._id,
          title: r.title,
          type: r.type,
          status: r.status,
          nextRunDate: r.nextRunDate
        })),
        summary: {
          totalPayments: payments.filter(p => p.status === 'Paid').length,
          totalAmount: payments
            .filter(p => p.status === 'Paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
          pendingMaintenance: maintenance.filter(m => m.status !== 'Completed').length,
          activeReminders: reminders.filter(r => r.status === 'active').length
        }
      };
    }

    res.status(200).json({
      success: true,
      data: unitData
    });
  } catch (error: any) {
    console.error('Unit data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unit data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const validateDataIntegrity = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { fix = false } = req.query;

    // Basic data integrity checks
    const properties = await Property.find({ organizationId: user.organizationId });
    const issues = [];
    const fixes = [];

    for (const property of properties) {
      // Check if property has units
      const Unit = require('../models/Unit').default;
      const unitCount = await Unit.countDocuments({ propertyId: property._id });
      
      if (unitCount === 0 && property.numberOfUnits > 0) {
        issues.push({
          type: 'missing_units',
          propertyId: property._id,
          propertyName: property.name,
          message: `Property has ${property.numberOfUnits} units defined but no unit records exist`
        });
        
        if (fix === 'true') {
          // Create missing units
          const unitsToCreate = [];
          for (let i = 1; i <= property.numberOfUnits; i++) {
            unitsToCreate.push({
              propertyId: property._id,
              organizationId: user.organizationId,
              unitNumber: i.toString(),
              status: 'Available',
              rentAmount: property.rentAmount || 0
            });
          }
          await Unit.insertMany(unitsToCreate);
          fixes.push(`Created ${unitsToCreate.length} units for property ${property.name}`);
        }
      }
      
      // Check for orphaned tenants
      const Tenant = require('../models/Tenant').default;
      const orphanedTenants = await Tenant.find({
        propertyId: property._id,
        unit: { $gt: property.numberOfUnits.toString() }
      });
      
      if (orphanedTenants.length > 0) {
        issues.push({
          type: 'orphaned_tenants',
          propertyId: property._id,
          propertyName: property.name,
          count: orphanedTenants.length,
          message: `${orphanedTenants.length} tenants assigned to non-existent units`
        });
        
        if (fix === 'true') {
          // Move orphaned tenants to available units or mark as inactive
          for (const tenant of orphanedTenants) {
            await Tenant.findByIdAndUpdate(tenant._id, { status: 'Inactive' });
          }
          fixes.push(`Deactivated ${orphanedTenants.length} orphaned tenants for property ${property.name}`);
        }
      }
    }

    res.status(200).json({
      success: true,
      action: fix === 'true' ? 'fix' : 'validate',
      data: {
        issues,
        fixes: fix === 'true' ? fixes : [],
        summary: {
          totalIssues: issues.length,
          fixesApplied: fix === 'true' ? fixes.length : 0
        }
      }
    });
  } catch (error: any) {
    console.error('Data validation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate data integrity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const regenerateDescription = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only modify properties they manage' });
      return;
    }

    const newDescription = generatePropertyDescription(property.toObject());
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { description: newDescription },
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('managedByAgentId', 'name email');

    res.status(200).json({ 
      success: true, 
      data: updatedProperty,
      message: 'Property description regenerated successfully'
    });
  } catch (error: any) {
    console.error('Regenerate description error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to regenerate description',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getPropertyUnits = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;
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

    const [Unit, Tenant] = await Promise.all([
      import('../models/Unit'),
      import('../models/Tenant')
    ]);

    // Get units from Unit model
    const units = await Unit.default.find({ 
      propertyId: propertyId,
      organizationId: user.organizationId
    }).populate('tenantId', 'name email phone status rentAmount').lean();

    // Get all tenants for this property
    const tenants = await Tenant.default.find({ 
      propertyId: propertyId,
      organizationId: user.organizationId
    }).lean();
    
    // Enhance units with tenant information
    const enhancedUnits = units.map(unit => {
      const tenant = tenants.find(t => t.unit === unit.unitNumber && t.status === 'Active');
      
      return {
        ...unit,
        isOccupied: !!tenant,
        tenant: tenant ? {
          _id: tenant._id,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          rentAmount: tenant.rentAmount,
          status: tenant.status,
          leaseStartDate: tenant.leaseStartDate,
          leaseEndDate: tenant.leaseEndDate
        } : null,
        displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber
      };
    });

    // Sort units by unit number
    enhancedUnits.sort((a, b) => {
      const aNum = parseInt(a.unitNumber) || 0;
      const bNum = parseInt(b.unitNumber) || 0;
      return aNum - bNum;
    });

    res.status(200).json({ 
      success: true, 
      data: enhancedUnits,
      summary: {
        totalUnits: enhancedUnits.length,
        occupiedUnits: enhancedUnits.filter(u => u.isOccupied).length,
        vacantUnits: enhancedUnits.filter(u => !u.isOccupied).length,
        occupancyRate: enhancedUnits.length > 0 
          ? Math.round((enhancedUnits.filter(u => u.isOccupied).length / enhancedUnits.length) * 100)
          : 0
      }
    });
  } catch (error: any) {
    console.error('Get property units error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property units',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Restore archived property
export const restoreProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (user.role === 'Agent') {
      res.status(403).json({ success: false, message: 'Agents cannot restore properties' });
      return;
    }

    const restoredProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Active',
        isActive: true
      },
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('managedByAgentId', 'name email');

    // Restore related units
    const Unit = require('../models/Unit').default;
    await Unit.updateMany(
      { propertyId: property._id },
      { status: 'Available' }
    );

    // Update usage count
    try {
      const subscriptionService = (await import('../services/subscriptionService')).default;
      await subscriptionService.updateUsage(user.organizationId, 'properties', 1);
    } catch (usageError) {
      console.error('Usage update error:', usageError);
    }

    res.status(200).json({ 
      success: true, 
      data: restoredProperty,
      message: 'Property restored successfully'
    });
  } catch (error: any) {
    console.error('Restore property error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to restore property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk operations for properties
export const bulkUpdateProperties = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyIds, updates } = req.body;
    
    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      res.status(400).json({ success: false, message: 'Property IDs are required' });
      return;
    }

    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ success: false, message: 'Updates object is required' });
      return;
    }

    // Verify all properties belong to the user's organization
    const properties = await Property.find({
      _id: { $in: propertyIds },
      organizationId: user.organizationId
    });

    if (properties.length !== propertyIds.length) {
      res.status(403).json({ success: false, message: 'Some properties not found or not authorized' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent') {
      const unauthorizedProperties = properties.filter(
        p => p.managedByAgentId?.toString() !== user._id.toString()
      );
      
      if (unauthorizedProperties.length > 0) {
        res.status(403).json({ success: false, message: 'Agents can only update properties they manage' });
        return;
      }
    }

    // Perform bulk update
    const result = await Property.updateMany(
      {
        _id: { $in: propertyIds },
        organizationId: user.organizationId
      },
      updates,
      { runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message: `${result.modifiedCount} properties updated successfully`
    });
  } catch (error: any) {
    console.error('Bulk update properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get property analytics
export const getPropertyAnalytics = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;
    const { period = '30d' } = req.query;

    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Agents can only view analytics for properties they manage' });
      return;
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const [Payment, Expense, MaintenanceRequest, Tenant] = await Promise.all([
      import('../models/Payment'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest'),
      import('../models/Tenant')
    ]);

    const [payments, expenses, maintenance, tenants] = await Promise.all([
      Payment.default.find({
        propertyId,
        organizationId: user.organizationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean(),
      Expense.default.find({
        propertyId,
        organizationId: user.organizationId,
        date: { $gte: startDate, $lte: endDate }
      }).lean(),
      MaintenanceRequest.default.find({
        propertyId,
        organizationId: user.organizationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean(),
      Tenant.default.find({
        propertyId,
        organizationId: user.organizationId
      }).lean()
    ]);

    // Calculate analytics
    const totalIncome = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netIncome = totalIncome - totalExpenses;
    
    const activeTenants = tenants.filter(t => t.status === 'Active');
    const occupancyRate = property.numberOfUnits > 0 
      ? (activeTenants.length / property.numberOfUnits) * 100
      : 0;
    
    const maintenanceStats = {
      total: maintenance.length,
      pending: maintenance.filter(m => m.status === 'Open').length,
      inProgress: maintenance.filter(m => m.status === 'In Progress').length,
      completed: maintenance.filter(m => m.status === 'Completed').length
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        financial: {
          totalIncome,
          totalExpenses,
          netIncome,
          profitMargin: totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0
        },
        occupancy: {
          rate: Math.round(occupancyRate),
          activeTenants: activeTenants.length,
          totalUnits: property.numberOfUnits,
          vacantUnits: property.numberOfUnits - activeTenants.length
        },
        maintenance: maintenanceStats,
        trends: {
          // Add trend calculations here if needed
        }
      }
    });
  } catch (error: any) {
    console.error('Get property analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};