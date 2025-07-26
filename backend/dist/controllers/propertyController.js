"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyAnalytics = exports.bulkUpdateProperties = exports.restoreProperty = exports.getPropertyUnits = exports.regenerateDescription = exports.validateDataIntegrity = exports.getUnitData = exports.getPropertyDataPreviews = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = exports.getPropertySummary = exports.searchProperties = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const actionChainService_1 = __importDefault(require("../services/actionChainService"));
const auditService_1 = __importDefault(require("../services/auditService"));
const validatePropertyInput = (data) => {
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
const searchProperties = async (req, res) => {
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
        let query = {
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
        if (user.role === 'Agent') {
            const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
            const managedPropertyIds = userData?.managedProperties || [];
            query._id = { $in: managedPropertyIds };
        }
        const properties = await Property_1.default.find(query)
            .select('name address propertyType numberOfUnits status imageUrl')
            .limit(Math.min(50, parseInt(limit)))
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
    }
    catch (error) {
        console.error('Search properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search properties',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.searchProperties = searchProperties;
const generatePropertyDescription = (property) => {
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
const calculatePropertyStats = async (propertyId, organizationId) => {
    try {
        const [Tenant, Payment, Expense, MaintenanceRequest] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Tenant'))),
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest')))
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
    }
    catch (error) {
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
const getPropertySummary = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        let query = {
            organizationId: user.organizationId,
            isActive: true
        };
        if (user.role === 'Agent') {
            const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
            const managedPropertyIds = userData?.managedProperties || [];
            query._id = { $in: managedPropertyIds };
        }
        const properties = await Property_1.default.find(query).lean();
        const [Tenant, Payment, Expense, MaintenanceRequest] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Tenant'))),
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest')))
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
        const propertyTypeDistribution = properties.reduce((acc, p) => {
            const type = p.propertyType || 'Other';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        const statusDistribution = properties.reduce((acc, p) => {
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
    }
    catch (error) {
        console.error('Get property summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property summary',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getPropertySummary = getPropertySummary;
const createProperty = async (req, res) => {
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
        const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
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
        const { error, value } = validatePropertyInput(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(d => d.message)
            });
            return;
        }
        const existingProperty = await Property_1.default.findOne({
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
        let imageUrl = req.body.imageUrl || '';
        if (req.file) {
            try {
                const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
                if (isCloudinaryConfigured()) {
                    imageUrl = await uploadToCloudinary(req.file, 'properties');
                    console.log('Image uploaded to Cloudinary:', imageUrl);
                }
                else {
                    imageUrl = `/uploads/images/${req.file.filename}`;
                    console.log('Image uploaded locally:', imageUrl);
                }
            }
            catch (error) {
                console.error('Image upload error:', error);
                imageUrl = `/uploads/images/${req.file.filename}`;
            }
        }
        const address = {
            street: req.body['address[street]'] || req.body.address?.street || '',
            city: req.body['address[city]'] || req.body.address?.city || '',
            state: req.body['address[state]'] || req.body.address?.state || '',
            zipCode: req.body['address[zipCode]'] || req.body.address?.zipCode || '',
            country: req.body['address[country]'] || req.body.address?.country || 'United States'
        };
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
            amenities: req.body.amenities ? req.body.amenities.split(',').map((a) => a.trim()) : [],
            description: ''
        };
        console.log('Property data being created:', propertyData);
        propertyData.description = generatePropertyDescription(propertyData);
        const property = await Property_1.default.create(propertyData);
        try {
            await actionChainService_1.default.onPropertyAdded(property, user._id, user.organizationId);
        }
        catch (actionError) {
            console.error('Action chain error:', actionError);
        }
        try {
            await subscriptionService.updateUsage(user.organizationId, 'properties', 1);
        }
        catch (usageError) {
            console.error('Usage update error:', usageError);
        }
        const populatedProperty = await Property_1.default.findById(property._id)
            .populate('createdBy', 'name email')
            .populate('managedByAgentId', 'name email')
            .lean();
        res.status(201).json({
            success: true,
            data: populatedProperty,
            message: 'Property created successfully'
        });
    }
    catch (error) {
        console.error('Create property error:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
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
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const { page = 1, limit = 50, status, propertyType, search, sortBy = 'createdAt', sortOrder = 'desc', includeArchived = 'false' } = req.query;
        let query = {
            organizationId: user.organizationId,
            isActive: true
        };
        if (includeArchived === 'true') {
            delete query.isActive;
        }
        else {
            query.status = { $ne: 'Archived' };
        }
        if (user.role === 'Agent') {
            const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
            const managedPropertyIds = userData?.managedProperties || [];
            query._id = { $in: managedPropertyIds };
        }
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
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [properties, totalCount] = await Promise.all([
            Property_1.default.find(query)
                .populate('createdBy', 'name email')
                .populate('managedByAgentId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean()
                .exec(),
            Property_1.default.countDocuments(query)
        ]);
        const Tenant = require('../models/Tenant').default;
        const propertiesWithOccupancy = await Promise.all(properties.map(async (property) => {
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
            }
            catch (error) {
                console.error(`Error calculating occupancy for property ${property._id}:`, error);
                return {
                    ...property,
                    occupancyRate: 0,
                    activeTenants: 0,
                    vacantUnits: property.numberOfUnits
                };
            }
        }));
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
    }
    catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getProperties = getProperties;
const getPropertyById = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const property = await Property_1.default.findById(req.params.id)
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
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({ success: false, message: 'Agents can only view properties they manage' });
            return;
        }
        const stats = await calculatePropertyStats(property._id.toString(), user.organizationId.toString());
        res.status(200).json({
            success: true,
            data: {
                ...property,
                stats
            }
        });
    }
    catch (error) {
        console.error('Get property by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getPropertyById = getPropertyById;
const updateProperty = async (req, res) => {
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
        let property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this property' });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({ success: false, message: 'Agents can only update properties they manage' });
            return;
        }
        const updates = {};
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
            if (newNumberOfUnits !== property.numberOfUnits) {
                const Unit = require('../models/Unit').default;
                const currentUnits = await Unit.countDocuments({ propertyId: property._id });
                if (newNumberOfUnits > currentUnits) {
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
                }
                else if (newNumberOfUnits < currentUnits) {
                    const Unit = require('../models/Unit').default;
                    await Unit.updateMany({
                        propertyId: property._id,
                        unitNumber: { $gt: newNumberOfUnits.toString() }
                    }, { status: 'Maintenance' });
                }
            }
        }
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
                ? req.body.amenities.split(',').map((a) => a.trim())
                : req.body.amenities;
        }
        if (req.body['address[street]'] || req.body.address) {
            updates.address = {
                street: req.body['address[street]'] || req.body.address?.street || property.address?.street || '',
                city: req.body['address[city]'] || req.body.address?.city || property.address?.city || '',
                state: req.body['address[state]'] || req.body.address?.state || property.address?.state || '',
                zipCode: req.body['address[zipCode]'] || req.body.address?.zipCode || property.address?.zipCode || '',
                country: req.body['address[country]'] || req.body.address?.country || property.address?.country || 'United States'
            };
        }
        if (req.file) {
            try {
                const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
                if (isCloudinaryConfigured()) {
                    updates.imageUrl = await uploadToCloudinary(req.file, 'properties');
                    console.log('Image uploaded to Cloudinary:', updates.imageUrl);
                }
                else {
                    updates.imageUrl = `/uploads/images/${req.file.filename}`;
                    console.log('Image updated locally:', updates.imageUrl);
                }
            }
            catch (error) {
                console.error('Image upload error:', error);
                updates.imageUrl = `/uploads/images/${req.file.filename}`;
            }
        }
        else if (req.body.imageUrl !== undefined) {
            updates.imageUrl = req.body.imageUrl;
        }
        const shouldRegenerateDescription = updates.name || updates.propertyType || updates.numberOfUnits || updates.address;
        if (shouldRegenerateDescription) {
            const updatedPropertyData = { ...property.toObject(), ...updates };
            updates.description = generatePropertyDescription(updatedPropertyData);
        }
        const updatedProperty = await Property_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name email')
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
    }
    catch (error) {
        console.error('Update property error:', error);
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
            message: 'Failed to update property',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
            return;
        }
        if (user.role === 'Agent') {
            res.status(403).json({ success: false, message: 'Agents cannot delete properties' });
            return;
        }
        const [Tenant, Payment, MaintenanceRequest] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Tenant'))),
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest')))
        ]);
        const [activeTenants, recentPayments, openMaintenance] = await Promise.all([
            Tenant.default.countDocuments({
                propertyId: property._id,
                status: 'Active'
            }),
            Payment.default.countDocuments({
                propertyId: property._id,
                status: 'Paid',
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
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
        const archivedProperty = await Property_1.default.findByIdAndUpdate(req.params.id, {
            status: 'Archived',
            isActive: false,
            archivedAt: new Date(),
            archivedBy: user._id
        }, { new: true });
        const Unit = require('../models/Unit').default;
        const cascadeOperations = [
            Unit.updateMany({ propertyId: property._id }, {
                status: 'Archived',
                $unset: { tenantId: 1 },
                archivedAt: new Date()
            }),
            Payment.default.updateMany({ propertyId: property._id, status: { $ne: 'Paid' } }, { status: 'Cancelled', cancelledAt: new Date() }),
            MaintenanceRequest.default.updateMany({ propertyId: property._id, status: { $in: ['Open', 'In Progress'] } }, { status: 'Cancelled', cancelledAt: new Date() })
        ];
        await Promise.allSettled(cascadeOperations);
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            await subscriptionService.updateUsage(user.organizationId, 'properties', -1);
        }
        catch (usageError) {
            console.error('Usage update error:', usageError);
        }
        await auditService_1.default.logProperty(user.organizationId, user._id, 'PROPERTY_ARCHIVED', property._id.toString(), { status: property.status }, {
            status: 'Archived',
            archivedAt: new Date(),
            cascadedItems: {
                units: await Unit.countDocuments({ propertyId: property._id, status: 'Archived' }),
                cancelledPayments: recentPayments,
                cancelledMaintenance: openMaintenance
            }
        });
        res.status(200).json({
            success: true,
            data: archivedProperty,
            message: 'Property archived successfully',
            details: {
                archivedUnits: await Unit.countDocuments({ propertyId: property._id, status: 'Archived' }),
                preservedPayments: await Payment.default.countDocuments({ propertyId: property._id, status: 'Paid' })
            }
        });
    }
    catch (error) {
        console.error('Archive property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive property',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.deleteProperty = deleteProperty;
const getPropertyDataPreviews = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId } = req.params;
        const { unit } = req.query;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({ success: false, message: 'Agents can only view data for properties they manage' });
            return;
        }
        const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, Tenant] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Receipt'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/Reminder'))),
            Promise.resolve().then(() => __importStar(require('../models/Tenant')))
        ]);
        let baseQuery = { propertyId, organizationId: user.organizationId };
        let tenantQuery = { propertyId, organizationId: user.organizationId };
        if (unit) {
            const tenant = await Tenant.default.findOne({ propertyId, unit, organizationId: user.organizationId });
            if (tenant) {
                baseQuery.tenantId = tenant._id;
                tenantQuery._id = tenant._id;
            }
            else {
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
    }
    catch (error) {
        console.error('Property data previews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property data previews',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getPropertyDataPreviews = getPropertyDataPreviews;
const getUnitData = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId, unitNumber } = req.params;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({ success: false, message: 'Agents can only view data for properties they manage' });
            return;
        }
        const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, Tenant, Unit] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Receipt'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/Reminder'))),
            Promise.resolve().then(() => __importStar(require('../models/Tenant'))),
            Promise.resolve().then(() => __importStar(require('../models/Unit')))
        ]);
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
        let unitData = {
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
    }
    catch (error) {
        console.error('Unit data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unit data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getUnitData = getUnitData;
const validateDataIntegrity = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { fix = false } = req.query;
        const properties = await Property_1.default.find({ organizationId: user.organizationId });
        const issues = [];
        const fixes = [];
        for (const property of properties) {
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
    }
    catch (error) {
        console.error('Data validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate data integrity',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.validateDataIntegrity = validateDataIntegrity;
const regenerateDescription = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({ success: false, message: 'Agents can only modify properties they manage' });
            return;
        }
        const newDescription = generatePropertyDescription(property.toObject());
        const updatedProperty = await Property_1.default.findByIdAndUpdate(req.params.id, { description: newDescription }, { new: true }).populate('createdBy', 'name email')
            .populate('managedByAgentId', 'name email');
        res.status(200).json({
            success: true,
            data: updatedProperty,
            message: 'Property description regenerated successfully'
        });
    }
    catch (error) {
        console.error('Regenerate description error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate description',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.regenerateDescription = regenerateDescription;
const getPropertyUnits = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId } = req.params;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({ success: false, message: 'Agents can only view units for properties they manage' });
            return;
        }
        const [Unit, Tenant] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Unit'))),
            Promise.resolve().then(() => __importStar(require('../models/Tenant')))
        ]);
        const units = await Unit.default.find({
            propertyId: propertyId,
            organizationId: user.organizationId
        }).populate('tenantId', 'name email phone status rentAmount').lean();
        const tenants = await Tenant.default.find({
            propertyId: propertyId,
            organizationId: user.organizationId
        }).lean();
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
    }
    catch (error) {
        console.error('Get property units error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property units',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getPropertyUnits = getPropertyUnits;
const restoreProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (user.role === 'Agent') {
            res.status(403).json({ success: false, message: 'Agents cannot restore properties' });
            return;
        }
        const restoredProperty = await Property_1.default.findByIdAndUpdate(req.params.id, {
            status: 'Active',
            isActive: true
        }, { new: true }).populate('createdBy', 'name email')
            .populate('managedByAgentId', 'name email');
        const Unit = require('../models/Unit').default;
        await Unit.updateMany({ propertyId: property._id }, { status: 'Available' });
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            await subscriptionService.updateUsage(user.organizationId, 'properties', 1);
        }
        catch (usageError) {
            console.error('Usage update error:', usageError);
        }
        res.status(200).json({
            success: true,
            data: restoredProperty,
            message: 'Property restored successfully'
        });
    }
    catch (error) {
        console.error('Restore property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore property',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.restoreProperty = restoreProperty;
const bulkUpdateProperties = async (req, res) => {
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
        const properties = await Property_1.default.find({
            _id: { $in: propertyIds },
            organizationId: user.organizationId
        });
        if (properties.length !== propertyIds.length) {
            res.status(403).json({ success: false, message: 'Some properties not found or not authorized' });
            return;
        }
        if (user.role === 'Agent') {
            const unauthorizedProperties = properties.filter(p => p.managedByAgentId?.toString() !== user._id.toString());
            if (unauthorizedProperties.length > 0) {
                res.status(403).json({ success: false, message: 'Agents can only update properties they manage' });
                return;
            }
        }
        const result = await Property_1.default.updateMany({
            _id: { $in: propertyIds },
            organizationId: user.organizationId
        }, updates, { runValidators: true });
        res.status(200).json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            },
            message: `${result.modifiedCount} properties updated successfully`
        });
    }
    catch (error) {
        console.error('Bulk update properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update properties',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.bulkUpdateProperties = bulkUpdateProperties;
const getPropertyAnalytics = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId } = req.params;
        const { period = '30d' } = req.query;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({ success: false, message: 'Agents can only view analytics for properties they manage' });
            return;
        }
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
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/Tenant')))
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
                trends: {}
            }
        });
    }
    catch (error) {
        console.error('Get property analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getPropertyAnalytics = getPropertyAnalytics;
