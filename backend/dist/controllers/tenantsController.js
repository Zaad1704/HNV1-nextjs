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
exports.downloadPersonalDetailsPDF = exports.bulkTenantActions = exports.getTenantSummary = exports.searchTenants = exports.downloadTenantDataZip = exports.downloadTenantPDF = exports.archiveTenant = exports.getTenantAnalytics = exports.getTenantStats = exports.getTenantDataPreviews = exports.deleteTenant = exports.updateTenant = exports.getTenantById = exports.createTenant = exports.getTenants = exports.restoreTenant = void 0;
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Property_1 = __importDefault(require("../models/Property"));
const actionChainService_1 = __importDefault(require("../services/actionChainService"));
const restoreTenant = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Tenant not found' });
            return;
        }
        if (user.role === 'Agent') {
            res.status(403).json({ success: false, message: 'Agents cannot restore tenants' });
            return;
        }
        const restoredTenant = await Tenant_1.default.findByIdAndUpdate(req.params.id, { status: 'Active' }, { new: true }).populate('propertyId', 'name address')
            .populate('createdBy', 'name email');
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            await subscriptionService.updateUsage(user.organizationId, 'tenants', 1);
        }
        catch (usageError) {
            console.error('Usage update error:', usageError);
        }
        res.status(200).json({
            success: true,
            data: restoredTenant,
            message: 'Tenant restored successfully'
        });
    }
    catch (error) {
        console.error('Restore tenant error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore tenant',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.restoreTenant = restoreTenant;
const getTenants = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { page = 1, limit = 50, status, propertyId, search, sortBy = 'createdAt', sortOrder = 'desc', includeArchived = 'false', leaseStatus } = req.query;
        let query = { organizationId: user.organizationId };
        if (status && status !== 'all') {
            query.status = status;
        }
        if (includeArchived !== 'true') {
            query.status = { ...query.status, $ne: 'Archived' };
        }
        if (propertyId) {
            query.propertyId = propertyId;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { unit: { $regex: search, $options: 'i' } }
            ];
        }
        if (leaseStatus) {
            const now = new Date();
            switch (leaseStatus) {
                case 'expiring':
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(now.getDate() + 30);
                    query.leaseEndDate = { $lte: thirtyDaysFromNow, $gte: now };
                    break;
                case 'expired':
                    query.leaseEndDate = { $lt: now };
                    break;
                case 'active':
                    query.leaseEndDate = { $gt: now };
                    break;
            }
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
        const [tenants, totalCount] = await Promise.all([
            Tenant_1.default.find(query)
                .populate('propertyId', 'name address')
                .populate('createdBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean()
                .exec(),
            Tenant_1.default.countDocuments(query)
        ]);
        const enhancedTenants = tenants.map(tenant => {
            const now = new Date();
            const leaseEndDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : null;
            const daysUntilExpiry = leaseEndDate ? Math.ceil((leaseEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
            let leaseStatus = 'No End Date';
            if (leaseEndDate) {
                if (daysUntilExpiry < 0)
                    leaseStatus = 'Expired';
                else if (daysUntilExpiry <= 30)
                    leaseStatus = 'Expiring Soon';
                else if (daysUntilExpiry <= 90)
                    leaseStatus = 'Expiring';
                else
                    leaseStatus = 'Active';
            }
            const effectiveRent = tenant.discountAmount &&
                (!tenant.discountExpiresAt || now <= new Date(tenant.discountExpiresAt))
                ? Math.max(0, (tenant.rentAmount || 0) - tenant.discountAmount)
                : tenant.rentAmount || 0;
            return {
                ...tenant,
                leaseStatus,
                daysUntilExpiry,
                effectiveRent,
                hasDiscount: tenant.discountAmount > 0 &&
                    (!tenant.discountExpiresAt || now <= new Date(tenant.discountExpiresAt))
            };
        });
        res.status(200).json({
            success: true,
            data: enhancedTenants,
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
        console.error('Get tenants error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tenants',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getTenants = getTenants;
const createTenant = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { name, email, phone, propertyId, unit, rentAmount, leaseStartDate, leaseEndDate, securityDeposit } = req.body;
        const requiredFields = { name, email, propertyId, unit, rentAmount };
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
            .map(([key]) => key);
        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
            return;
        }
        const rentAmountNum = parseFloat(rentAmount);
        if (isNaN(rentAmountNum) || rentAmountNum < 0) {
            res.status(400).json({
                success: false,
                message: 'Rent amount must be a valid positive number'
            });
            return;
        }
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(400).json({
                success: false,
                message: 'Invalid property or property not found'
            });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Agents can only add tenants to properties they manage'
            });
            return;
        }
        const Unit = require('../models/Unit').default;
        const unitRecord = await Unit.findOne({
            propertyId,
            unitNumber: unit,
            organizationId: user.organizationId
        });
        if (!unitRecord) {
            res.status(400).json({
                success: false,
                message: `Unit ${unit} does not exist in this property`
            });
            return;
        }
        if (unitRecord.status === 'Occupied' || unitRecord.tenantId) {
            res.status(400).json({
                success: false,
                message: `Unit ${unit} is already occupied`
            });
            return;
        }
        const existingTenant = await Tenant_1.default.findOne({
            email: email.toLowerCase(),
            organizationId: user.organizationId,
            status: { $ne: 'Archived' }
        });
        if (existingTenant) {
            res.status(400).json({
                success: false,
                message: `A tenant with email ${email} already exists`
            });
            return;
        }
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            const usageCheck = await subscriptionService.checkUsageLimit(user.organizationId, 'tenants');
            if (!usageCheck.allowed) {
                res.status(403).json({
                    success: false,
                    message: 'Tenant limit exceeded',
                    reason: usageCheck.reason,
                    currentUsage: usageCheck.currentUsage,
                    limit: usageCheck.limit
                });
                return;
            }
        }
        catch (subscriptionError) {
            console.error('Subscription check error:', subscriptionError);
        }
        const imageUrls = {};
        const files = req.files;
        if (files && Object.keys(files).length > 0) {
            try {
                const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
                if (isCloudinaryConfigured()) {
                    console.log('Uploading images to Cloudinary...');
                    for (const [fieldname, fileArray] of Object.entries(files)) {
                        if (fileArray && fileArray[0]) {
                            const file = fileArray[0];
                            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                            if (!allowedTypes.includes(file.mimetype)) {
                                console.warn(`Skipping ${fieldname}: Invalid file type ${file.mimetype}`);
                                continue;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                                console.warn(`Skipping ${fieldname}: File too large (${file.size} bytes)`);
                                continue;
                            }
                            try {
                                console.log(`Uploading ${fieldname} to Cloudinary...`);
                                const cloudinaryUrl = await uploadToCloudinary(file, 'tenants');
                                imageUrls[fieldname] = cloudinaryUrl;
                                if (fieldname === 'tenantImage') {
                                    imageUrls.imageUrl = cloudinaryUrl;
                                }
                                console.log(`✅ ${fieldname} uploaded successfully`);
                            }
                            catch (uploadError) {
                                console.error(`❌ Failed to upload ${fieldname}:`, uploadError);
                            }
                        }
                    }
                }
                else {
                    console.log('Cloudinary not configured, using local storage...');
                    for (const [fieldname, fileArray] of Object.entries(files)) {
                        if (fileArray && fileArray[0]) {
                            const file = fileArray[0];
                            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                            if (!allowedTypes.includes(file.mimetype)) {
                                continue;
                            }
                            const localUrl = `/uploads/images/${file.filename}`;
                            imageUrls[fieldname] = localUrl;
                            if (fieldname === 'tenantImage') {
                                imageUrls.imageUrl = localUrl;
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Image upload error:', error);
            }
        }
        let additionalAdults = [];
        if (req.body.additionalAdults) {
            try {
                const parsed = typeof req.body.additionalAdults === 'string'
                    ? JSON.parse(req.body.additionalAdults)
                    : req.body.additionalAdults;
                if (Array.isArray(parsed)) {
                    additionalAdults = parsed.map((adult, index) => {
                        const validatedAdult = {};
                        if (adult.name && typeof adult.name === 'string') {
                            validatedAdult.name = adult.name.trim().substring(0, 100);
                        }
                        if (adult.phone && typeof adult.phone === 'string') {
                            validatedAdult.phone = adult.phone.trim();
                        }
                        if (adult.relation && typeof adult.relation === 'string') {
                            validatedAdult.relation = adult.relation.trim().substring(0, 50);
                        }
                        if (adult.fatherName && typeof adult.fatherName === 'string') {
                            validatedAdult.fatherName = adult.fatherName.trim().substring(0, 100);
                        }
                        if (adult.motherName && typeof adult.motherName === 'string') {
                            validatedAdult.motherName = adult.motherName.trim().substring(0, 100);
                        }
                        if (adult.permanentAddress && typeof adult.permanentAddress === 'string') {
                            validatedAdult.permanentAddress = adult.permanentAddress.trim().substring(0, 500);
                        }
                        if (adult.govtIdNumber && typeof adult.govtIdNumber === 'string') {
                            validatedAdult.govtIdNumber = adult.govtIdNumber.trim().substring(0, 50);
                        }
                        validatedAdult.imageUrl = imageUrls[`additionalAdultImage_${index}`] || adult.imageUrl || '';
                        validatedAdult.govtIdImageUrl = imageUrls[`additionalAdultGovtId_${index}`] || adult.govtIdImageUrl || '';
                        return validatedAdult;
                    }).filter(adult => adult.name);
                }
            }
            catch (e) {
                console.error('Failed to parse additional adults:', e);
                additionalAdults = [];
            }
        }
        const emergencyContact = {};
        if (req.body.emergencyContactName) {
            emergencyContact.name = req.body.emergencyContactName.trim().substring(0, 100);
        }
        if (req.body.emergencyContactPhone) {
            const phone = req.body.emergencyContactPhone.trim();
            if (/^[\+]?[1-9][\d]{1,14}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
                emergencyContact.phone = phone;
            }
        }
        if (req.body.emergencyContactRelation) {
            emergencyContact.relation = req.body.emergencyContactRelation.trim().substring(0, 50);
        }
        const reference = {};
        if (req.body.referenceName) {
            reference.name = req.body.referenceName.trim().substring(0, 100);
        }
        if (req.body.referencePhone) {
            const phone = req.body.referencePhone.trim();
            if (/^[\+]?[1-9][\d]{1,14}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
                reference.phone = phone;
            }
        }
        if (req.body.referenceEmail) {
            const email = req.body.referenceEmail.trim().toLowerCase();
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                reference.email = email;
            }
        }
        if (req.body.referenceAddress) {
            reference.address = req.body.referenceAddress.trim().substring(0, 500);
        }
        if (req.body.referenceRelation) {
            reference.relation = req.body.referenceRelation.trim().substring(0, 50);
        }
        if (req.body.referenceGovtId) {
            reference.govtIdNumber = req.body.referenceGovtId.trim().substring(0, 50);
        }
        let leaseStart;
        let leaseEnd;
        if (leaseStartDate) {
            leaseStart = new Date(leaseStartDate);
            if (isNaN(leaseStart.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid lease start date'
                });
                return;
            }
        }
        if (leaseEndDate) {
            leaseEnd = new Date(leaseEndDate);
            if (isNaN(leaseEnd.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid lease end date'
                });
                return;
            }
            if (leaseStart && leaseEnd <= leaseStart) {
                res.status(400).json({
                    success: false,
                    message: 'Lease end date must be after lease start date'
                });
                return;
            }
        }
        const tenantData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : undefined,
            whatsappNumber: req.body.whatsappNumber ? req.body.whatsappNumber.trim() : undefined,
            propertyId,
            unit: unit.trim(),
            rentAmount: rentAmountNum,
            leaseStartDate: leaseStart,
            leaseEndDate: leaseEnd,
            leaseDuration: req.body.leaseDuration ? Math.max(1, parseInt(req.body.leaseDuration)) : 12,
            securityDeposit: req.body.securityDeposit ? Math.max(0, parseFloat(req.body.securityDeposit)) : 0,
            advanceRent: req.body.advanceRent ? Math.max(0, parseFloat(req.body.advanceRent)) : 0,
            status: req.body.status || 'Active',
            organizationId: user.organizationId,
            createdBy: user._id
        };
        if (req.body.fatherName) {
            tenantData.fatherName = req.body.fatherName.trim().substring(0, 100);
        }
        if (req.body.motherName) {
            tenantData.motherName = req.body.motherName.trim().substring(0, 100);
        }
        if (req.body.presentAddress) {
            tenantData.presentAddress = req.body.presentAddress.trim().substring(0, 500);
        }
        if (req.body.permanentAddress) {
            tenantData.permanentAddress = req.body.permanentAddress.trim().substring(0, 500);
        }
        if (req.body.govtIdNumber) {
            tenantData.govtIdNumber = req.body.govtIdNumber.trim().substring(0, 50);
        }
        if (req.body.occupation) {
            tenantData.occupation = req.body.occupation.trim().substring(0, 100);
        }
        if (req.body.monthlyIncome) {
            const income = parseFloat(req.body.monthlyIncome);
            if (!isNaN(income) && income >= 0) {
                tenantData.monthlyIncome = income;
            }
        }
        if (req.body.previousAddress) {
            tenantData.previousAddress = req.body.previousAddress.trim().substring(0, 500);
        }
        if (req.body.reasonForMoving) {
            tenantData.reasonForMoving = req.body.reasonForMoving.trim().substring(0, 500);
        }
        if (req.body.petDetails) {
            tenantData.petDetails = req.body.petDetails.trim().substring(0, 500);
        }
        if (req.body.vehicleDetails) {
            tenantData.vehicleDetails = req.body.vehicleDetails.trim().substring(0, 500);
        }
        if (req.body.specialInstructions) {
            tenantData.specialInstructions = req.body.specialInstructions.trim().substring(0, 1000);
        }
        if (req.body.numberOfOccupants) {
            const occupants = parseInt(req.body.numberOfOccupants);
            if (!isNaN(occupants) && occupants >= 1 && occupants <= 20) {
                tenantData.numberOfOccupants = occupants;
            }
        }
        if (req.body.discountAmount) {
            const discount = parseFloat(req.body.discountAmount);
            if (!isNaN(discount) && discount >= 0) {
                tenantData.discountAmount = discount;
            }
        }
        if (req.body.discountExpiresAt) {
            const expiryDate = new Date(req.body.discountExpiresAt);
            if (!isNaN(expiryDate.getTime()) && expiryDate > new Date()) {
                tenantData.discountExpiresAt = expiryDate;
            }
        }
        Object.assign(tenantData, imageUrls);
        if (Object.keys(emergencyContact).length > 0) {
            tenantData.emergencyContact = emergencyContact;
        }
        if (Object.keys(reference).length > 0) {
            tenantData.reference = reference;
        }
        if (additionalAdults.length > 0) {
            tenantData.additionalAdults = additionalAdults;
        }
        console.log('Creating tenant:', {
            name: tenantData.name,
            email: tenantData.email,
            propertyId: tenantData.propertyId,
            unit: tenantData.unit,
            rentAmount: tenantData.rentAmount,
            additionalAdults: additionalAdults.length,
            hasImages: Object.keys(imageUrls).length > 0
        });
        const tenant = await Tenant_1.default.create(tenantData);
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            await subscriptionService.updateUsage(user.organizationId, 'tenants', 1);
        }
        catch (usageError) {
            console.error('Usage update error:', usageError);
        }
        try {
            await actionChainService_1.default.onTenantAdded(tenant, user._id, user.organizationId);
        }
        catch (actionError) {
            console.error('Action chain error (non-critical):', actionError);
        }
        const populatedTenant = await Tenant_1.default.findById(tenant._id)
            .populate('propertyId', 'name address')
            .populate('createdBy', 'name email')
            .lean();
        res.status(201).json({
            success: true,
            data: populatedTenant,
            message: 'Tenant created successfully'
        });
    }
    catch (error) {
        console.error('Create tenant error:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            let message = 'Duplicate entry detected';
            if (field === 'email') {
                message = 'A tenant with this email already exists';
            }
            else if (field === 'propertyId_1_unit_1') {
                message = 'This unit is already occupied';
            }
            res.status(400).json({
                success: false,
                message
            });
            return;
        }
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
            return;
        }
        if (error.name === 'CastError') {
            res.status(400).json({
                success: false,
                message: 'Invalid data format provided'
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create tenant',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.createTenant = createTenant;
const getTenantById = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const tenant = await Tenant_1.default.findById(req.params.id)
            .populate('propertyId', 'name address')
            .populate('createdBy', 'name email')
            .lean();
        if (!tenant) {
            res.status(404).json({ success: false, message: 'Tenant not found' });
            return;
        }
        if (tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const property = await Property.findById(tenant.propertyId);
            if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
                res.status(403).json({ success: false, message: 'Agents can only view tenants from properties they manage' });
                return;
            }
        }
        const now = new Date();
        const leaseEndDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : null;
        const daysUntilExpiry = leaseEndDate ? Math.ceil((leaseEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
        let leaseStatus = 'No End Date';
        if (leaseEndDate) {
            if (daysUntilExpiry < 0)
                leaseStatus = 'Expired';
            else if (daysUntilExpiry <= 30)
                leaseStatus = 'Expiring Soon';
            else if (daysUntilExpiry <= 90)
                leaseStatus = 'Expiring';
            else
                leaseStatus = 'Active';
        }
        const effectiveRent = tenant.discountAmount &&
            (!tenant.discountExpiresAt || now <= new Date(tenant.discountExpiresAt))
            ? Math.max(0, (tenant.rentAmount || 0) - tenant.discountAmount)
            : tenant.rentAmount || 0;
        const enhancedTenant = {
            ...tenant,
            leaseStatus,
            daysUntilExpiry,
            effectiveRent,
            hasDiscount: tenant.discountAmount > 0 &&
                (!tenant.discountExpiresAt || now <= new Date(tenant.discountExpiresAt))
        };
        res.status(200).json({ success: true, data: enhancedTenant });
    }
    catch (error) {
        console.error('Get tenant by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tenant',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getTenantById = getTenantById;
const updateTenant = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Tenant not found' });
            return;
        }
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const property = await Property.findById(tenant.propertyId);
            if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
                res.status(403).json({ success: false, message: 'Agents can only update tenants from properties they manage' });
                return;
            }
        }
        const imageUrls = {};
        const files = req.files;
        if (files) {
            try {
                const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
                if (isCloudinaryConfigured()) {
                    for (const [fieldname, fileArray] of Object.entries(files)) {
                        if (fileArray && fileArray[0]) {
                            const file = fileArray[0];
                            try {
                                const cloudinaryUrl = await uploadToCloudinary(file, 'tenants');
                                imageUrls[fieldname] = cloudinaryUrl;
                                if (fieldname === 'tenantImage') {
                                    imageUrls.imageUrl = cloudinaryUrl;
                                }
                            }
                            catch (uploadError) {
                                console.error(`Failed to upload ${fieldname}:`, uploadError);
                            }
                        }
                    }
                }
                else {
                    for (const [fieldname, fileArray] of Object.entries(files)) {
                        if (fileArray && fileArray[0]) {
                            const file = fileArray[0];
                            const localUrl = `/uploads/images/${file.filename}`;
                            imageUrls[fieldname] = localUrl;
                            if (fieldname === 'tenantImage') {
                                imageUrls.imageUrl = localUrl;
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Image upload error:', error);
            }
        }
        let additionalAdults = [];
        if (req.body.additionalAdults) {
            try {
                const parsed = JSON.parse(req.body.additionalAdults);
                additionalAdults = Array.isArray(parsed) ? parsed.map((adult, index) => ({
                    ...adult,
                    imageUrl: imageUrls[`additionalAdultImage_${index}`] || adult.imageUrl || '',
                    govtIdImageUrl: imageUrls[`additionalAdultGovtId_${index}`] || adult.govtIdImageUrl || ''
                })) : [];
            }
            catch (e) {
                console.error('Failed to parse additional adults:', e);
                additionalAdults = tenant.additionalAdults || [];
            }
        }
        const updateData = {
            ...req.body,
            ...imageUrls,
            additionalAdults
        };
        const updatedTenant = await Tenant_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('propertyId', 'name');
        res.status(200).json({ success: true, data: updatedTenant });
    }
    catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateTenant = updateTenant;
const deleteTenant = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Tenant not found' });
            return;
        }
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const property = await Property.findById(tenant.propertyId);
            if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
                res.status(403).json({ success: false, message: 'Agents can only delete tenants from properties they manage' });
                return;
            }
        }
        const Payment = require('../models/Payment').default;
        const activePayments = await Payment.countDocuments({
            tenantId: tenant._id,
            status: { $in: ['Pending', 'Processing'] }
        });
        if (activePayments > 0) {
            res.status(400).json({
                success: false,
                message: `Cannot delete tenant with ${activePayments} active payment(s). Please complete or cancel payments first.`
            });
            return;
        }
        const tenantInfo = {
            name: tenant.name,
            email: tenant.email,
            unit: tenant.unit,
            propertyId: tenant.propertyId,
            rentAmount: tenant.rentAmount
        };
        const archivedTenant = await Tenant_1.default.findByIdAndUpdate(req.params.id, { status: 'Archived' }, { new: true });
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            await subscriptionService.updateUsage(user.organizationId, 'tenants', -1);
        }
        catch (usageError) {
            console.error('Usage update error:', usageError);
        }
        try {
            const AuditLog = await Promise.resolve().then(() => __importStar(require('../models/AuditLog')));
            await AuditLog.default.create({
                userId: user._id,
                organizationId: user.organizationId,
                action: 'tenant_archived',
                resource: 'tenant',
                resourceId: req.params.id,
                details: tenantInfo,
                timestamp: new Date()
            });
        }
        catch (actionError) {
            console.error('Audit log error (non-critical):', actionError);
        }
        res.status(200).json({
            success: true,
            data: archivedTenant,
            message: 'Tenant archived successfully'
        });
    }
    catch (error) {
        console.error('Delete tenant error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete tenant',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.deleteTenant = deleteTenant;
const getTenantDataPreviews = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { tenantId } = req.params;
        const { status, date } = req.query;
        const tenant = await Tenant_1.default.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, ApprovalRequest, AuditLog] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Receipt'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/Reminder'))),
            Promise.resolve().then(() => __importStar(require('../models/ApprovalRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/AuditLog')))
        ]);
        let baseQuery = { tenantId, organizationId: user.organizationId };
        const [payments, receipts, expenses, maintenance, reminders, approvals, auditLogs] = await Promise.all([
            Payment.default.find(baseQuery).populate('propertyId', 'name').populate('tenantId', 'name unit').sort({ paymentDate: -1 }).limit(5).lean(),
            Receipt.default.find(baseQuery).populate('propertyId', 'name').populate('tenantId', 'name unit').sort({ createdAt: -1 }).limit(5).lean(),
            Expense.default.find({ propertyId: tenant.propertyId, organizationId: user.organizationId }).populate('propertyId', 'name').sort({ date: -1 }).limit(5).lean(),
            MaintenanceRequest.default.find(baseQuery).populate('assignedTo', 'name').populate('propertyId', 'name').populate('tenantId', 'name unit').sort({ createdAt: -1 }).limit(5).lean(),
            Reminder.default.find(baseQuery).populate('tenantId', 'name unit').populate('propertyId', 'name').sort({ nextRunDate: 1 }).limit(5).lean(),
            ApprovalRequest.default.find({ tenantId, organizationId: user.organizationId }).populate('requestedBy', 'name').populate('propertyId', 'name').sort({ createdAt: -1 }).limit(5).lean(),
            AuditLog.default.find({
                organizationId: user.organizationId,
                $or: [{ resourceId: tenantId }, { 'metadata.tenantId': tenantId }]
            }).populate('userId', 'name').sort({ timestamp: -1 }).limit(10).lean()
        ]);
        res.status(200).json({
            success: true,
            data: {
                payments: payments.map(p => ({
                    _id: p._id,
                    amount: p.amount,
                    status: p.status,
                    paymentDate: p.paymentDate,
                    paymentMethod: p.paymentMethod,
                    rentMonth: p.rentMonth,
                    property: p.propertyId,
                    tenant: p.tenantId
                })),
                receipts: receipts.map(r => ({
                    _id: r._id,
                    receiptNumber: r.receiptNumber,
                    amount: r.amount,
                    paymentDate: r.paymentDate,
                    paymentMethod: r.paymentMethod,
                    property: r.propertyId,
                    tenant: r.tenantId
                })),
                expenses: expenses.map(e => ({
                    _id: e._id,
                    description: e.description,
                    amount: e.amount,
                    category: e.category,
                    date: e.date,
                    property: e.propertyId
                })),
                maintenance: maintenance.map(m => ({
                    _id: m._id,
                    description: m.description,
                    status: m.status,
                    priority: m.priority,
                    assignedTo: m.assignedTo,
                    createdAt: m.createdAt,
                    property: m.propertyId,
                    tenant: m.tenantId
                })),
                reminders: reminders.map(r => ({
                    _id: r._id,
                    title: r.title,
                    type: r.type,
                    status: r.status,
                    nextRunDate: r.nextRunDate,
                    tenant: r.tenantId,
                    property: r.propertyId
                })),
                approvals: approvals.map(a => ({
                    _id: a._id,
                    type: a.type,
                    description: a.description,
                    status: a.status,
                    priority: a.priority,
                    requestedBy: a.requestedBy,
                    createdAt: a.createdAt,
                    property: a.propertyId
                })),
                auditLogs: auditLogs.map(l => ({
                    _id: l._id,
                    action: l.action,
                    resource: l.resource,
                    description: l.description,
                    user: l.userId,
                    timestamp: l.timestamp,
                    severity: l.severity
                }))
            }
        });
    }
    catch (error) {
        console.error('Tenant data previews error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getTenantDataPreviews = getTenantDataPreviews;
const getTenantStats = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { tenantId } = req.params;
        const tenant = await Tenant_1.default.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const [Payment, MaintenanceRequest] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest')))
        ]);
        const [payments, maintenance] = await Promise.all([
            Payment.default.find({ tenantId, organizationId: user.organizationId }).lean(),
            MaintenanceRequest.default.find({ tenantId, organizationId: user.organizationId }).lean()
        ]);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyPayments = payments.filter((p) => {
            const paymentDate = new Date(p.paymentDate);
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const monthlyPaid = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const outstandingAmount = monthlyPaid >= (tenant.rentAmount || 0) ? 0 : (tenant.rentAmount || 0) - monthlyPaid;
        const openMaintenance = maintenance.filter((m) => m.status === 'Open').length;
        const totalMaintenance = maintenance.length;
        const leaseStartDate = tenant.createdAt ? new Date(tenant.createdAt) : new Date();
        const monthsSinceStart = (currentYear - leaseStartDate.getFullYear()) * 12 + (currentMonth - leaseStartDate.getMonth()) + 1;
        const monthsPaid = payments.length;
        const paymentRate = monthsSinceStart > 0 ? (monthsPaid / monthsSinceStart) * 100 : 0;
        res.status(200).json({
            success: true,
            data: {
                payments: {
                    total: payments.length,
                    totalAmount: totalPaid,
                    monthlyPaid,
                    outstanding: outstandingAmount,
                    paymentRate: Math.round(paymentRate)
                },
                maintenance: {
                    total: totalMaintenance,
                    open: openMaintenance,
                    closed: totalMaintenance - openMaintenance
                },
                lease: {
                    startDate: leaseStartDate,
                    monthsSinceStart,
                    monthsPaid,
                    rentAmount: tenant.rentAmount || 0
                }
            }
        });
    }
    catch (error) {
        console.error('Tenant stats error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getTenantStats = getTenantStats;
const getTenantAnalytics = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { tenantId } = req.params;
        const { range = '12months' } = req.query;
        const tenant = await Tenant_1.default.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const [Payment, MaintenanceRequest] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest')))
        ]);
        const endDate = new Date();
        const startDate = new Date();
        switch (range) {
            case '3months':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case '6months':
                startDate.setMonth(endDate.getMonth() - 6);
                break;
            case '12months':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setFullYear(2020);
        }
        const [payments, maintenance] = await Promise.all([
            Payment.default.find({
                tenantId,
                organizationId: user.organizationId,
                paymentDate: { $gte: startDate, $lte: endDate }
            }).lean(),
            MaintenanceRequest.default.find({
                tenantId,
                organizationId: user.organizationId,
                createdAt: { $gte: startDate, $lte: endDate }
            }).lean()
        ]);
        const monthlyData = [];
        const months = range === '3months' ? 3 : range === '6months' ? 6 : 12;
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthPayments = payments.filter((p) => {
                const paymentDate = new Date(p.paymentDate);
                return paymentDate.getMonth() === date.getMonth() &&
                    paymentDate.getFullYear() === date.getFullYear();
            });
            monthlyData.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                payments: monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
                count: monthPayments.length
            });
        }
        const totalPayments = payments.length;
        const onTimePayments = payments.filter((p) => {
            const paymentDate = new Date(p.paymentDate);
            const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
            return paymentDate.getTime() <= expectedDate.getTime() + (5 * 24 * 60 * 60 * 1000);
        }).length;
        const paymentScore = totalPayments > 0 ? Math.round((onTimePayments / totalPayments) * 100) : 100;
        const avgDaysLate = totalPayments > 0 ?
            payments.reduce((sum, p) => {
                const paymentDate = new Date(p.paymentDate);
                const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
                const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)));
                return sum + daysLate;
            }, 0) / totalPayments : 0;
        res.status(200).json({
            success: true,
            data: {
                monthlyPayments: monthlyData,
                totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                paymentCount: payments.length,
                paymentScore,
                avgDaysLate: Math.round(avgDaysLate),
                maintenanceRequests: maintenance.length,
                behaviorInsights: {
                    punctuality: paymentScore,
                    responsiveness: paymentScore > 80 ? 'High' : paymentScore > 60 ? 'Medium' : 'Low',
                    riskLevel: paymentScore > 80 ? 'Low' : paymentScore > 60 ? 'Medium' : 'High'
                }
            }
        });
    }
    catch (error) {
        console.error('Tenant analytics error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getTenantAnalytics = getTenantAnalytics;
const archiveTenant = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const newStatus = tenant.status === 'Archived' ? 'Active' : 'Archived';
        const updatedTenant = await Tenant_1.default.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
        try {
            const AuditLog = await Promise.resolve().then(() => __importStar(require('../models/AuditLog')));
            await AuditLog.default.create({
                userId: req.user._id,
                organizationId: req.user.organizationId,
                action: newStatus === 'Archived' ? 'tenant_archived' : 'tenant_restored',
                resource: 'tenant',
                resourceId: req.params.id,
                details: {
                    tenantName: tenant.name,
                    previousStatus: tenant.status,
                    newStatus
                },
                timestamp: new Date()
            });
        }
        catch (actionError) {
            console.error('Audit log error (non-critical):', actionError);
        }
        res.status(200).json({
            success: true,
            data: updatedTenant,
            message: `Tenant ${newStatus === 'Archived' ? 'archived' : 'restored'} successfully`
        });
    }
    catch (error) {
        console.error('Archive tenant error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.archiveTenant = archiveTenant;
const downloadTenantPDF = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenant = await Tenant_1.default.findById(req.params.id).populate('propertyId', 'name');
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const [Payment, Receipt, Expense, MaintenanceRequest] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Receipt'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest')))
        ]);
        const [payments, receipts, expenses, maintenance] = await Promise.all([
            Payment.default.find({ tenantId: req.params.id, organizationId: req.user.organizationId }).sort({ paymentDate: -1 }).lean(),
            Receipt.default.find({ tenantId: req.params.id, organizationId: req.user.organizationId }).sort({ createdAt: -1 }).lean(),
            Expense.default.find({ propertyId: tenant.propertyId, organizationId: req.user.organizationId }).sort({ date: -1 }).limit(10).lean(),
            MaintenanceRequest.default.find({ tenantId: req.params.id, organizationId: req.user.organizationId }).sort({ createdAt: -1 }).lean()
        ]);
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-comprehensive-report.pdf"`);
        doc.pipe(res);
        doc.rect(0, 0, doc.page.width, 80).fill('#2563eb');
        doc.fontSize(28).fillColor('#ffffff').text('TENANT COMPREHENSIVE REPORT', 40, 25, { align: 'center' });
        doc.fontSize(12).text('Property Management System', 40, 55, { align: 'center' });
        doc.y = 100;
        doc.fillColor('#000000');
        doc.fontSize(18).fillColor('#2563eb').text('TENANT OVERVIEW', { underline: true });
        doc.moveDown(0.5);
        const leftColumn = 60;
        const rightColumn = 320;
        let currentY = doc.y;
        doc.fontSize(12).fillColor('#000000');
        doc.text('Full Name:', leftColumn, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.name}`);
        doc.font('Helvetica').text('Email:', leftColumn, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.email}`);
        doc.font('Helvetica').text('Phone:', leftColumn, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${tenant.phone}`);
        doc.font('Helvetica').text('Status:', leftColumn, currentY + 60, { continued: true }).font('Helvetica-Bold').fillColor(tenant.status === 'Active' ? '#16a34a' : '#dc2626').text(` ${tenant.status}`);
        doc.fillColor('#000000').font('Helvetica');
        doc.text('Property:', rightColumn, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.propertyId?.name || 'N/A'}`);
        doc.font('Helvetica').text('Unit Number:', rightColumn, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.unit}`);
        doc.font('Helvetica').text('Monthly Rent:', rightColumn, currentY + 40, { continued: true }).font('Helvetica-Bold').fillColor('#16a34a').text(` $${tenant.rentAmount || 0}`);
        doc.fillColor('#000000').font('Helvetica').text('Security Deposit:', rightColumn, currentY + 60, { continued: true }).font('Helvetica-Bold').text(` $${tenant.securityDeposit || 0}`);
        doc.y = currentY + 100;
        doc.moveDown();
        doc.fontSize(16).fillColor('#2563eb').text('LEASE INFORMATION', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000000');
        if (tenant.leaseStartDate) {
            doc.text(`Lease Start: ${new Date(tenant.leaseStartDate).toLocaleDateString()}`);
        }
        if (tenant.leaseEndDate) {
            const daysRemaining = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            doc.text(`Lease End: ${new Date(tenant.leaseEndDate).toLocaleDateString()}`);
            doc.text(`Days Remaining: ${daysRemaining > 0 ? daysRemaining : 'Expired'} days`, { fillColor: daysRemaining < 30 ? '#dc2626' : '#000000' });
        }
        doc.text(`Lease Duration: ${tenant.leaseDuration || 12} months`);
        doc.moveDown();
        doc.fontSize(16).fillColor('#2563eb').text('PAYMENT ANALYSIS', { underline: true });
        doc.moveDown(0.5);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthPayments = payments.filter((p) => {
            const paymentDate = new Date(p.paymentDate);
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });
        const currentMonthPaid = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const outstandingAmount = (tenant.rentAmount || 0) - currentMonthPaid;
        doc.fontSize(12);
        doc.text(`Total Payments Made: ${payments.length}`);
        doc.text(`Total Amount Paid: $${totalPaid}`, { fillColor: '#16a34a' });
        doc.text(`Current Month Paid: $${currentMonthPaid}`);
        doc.text(`Outstanding Amount: $${Math.max(0, outstandingAmount)}`, { fillColor: outstandingAmount > 0 ? '#dc2626' : '#16a34a' });
        doc.text(`Average Monthly Payment: $${payments.length > 0 ? Math.round(totalPaid / payments.length) : 0}`);
        doc.moveDown();
        if (payments.length > 0) {
            doc.fontSize(14).fillColor('#2563eb').text('RECENT PAYMENTS', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(10);
            doc.rect(40, doc.y, 515, 20).fill('#f3f4f6');
            doc.fillColor('#000000').text('Date', 50, doc.y + 5);
            doc.text('Amount', 150, doc.y + 5);
            doc.text('Method', 250, doc.y + 5);
            doc.text('Status', 350, doc.y + 5);
            doc.text('Month', 450, doc.y + 5);
            doc.y += 25;
            payments.slice(0, 5).forEach((payment, index) => {
                const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                doc.rect(40, doc.y - 2, 515, 18).fill(bgColor);
                doc.fillColor('#000000');
                doc.text(new Date(payment.paymentDate).toLocaleDateString(), 50, doc.y + 2);
                doc.text(`$${payment.amount}`, 150, doc.y + 2);
                doc.text(payment.paymentMethod || 'N/A', 250, doc.y + 2);
                doc.fillColor(payment.status === 'Paid' ? '#16a34a' : '#dc2626').text(payment.status, 350, doc.y + 2);
                doc.fillColor('#000000').text(payment.rentMonth || 'N/A', 450, doc.y + 2);
                doc.y += 18;
            });
            doc.moveDown();
        }
        if (maintenance.length > 0) {
            doc.fontSize(16).fillColor('#2563eb').text('MAINTENANCE ANALYSIS', { underline: true });
            doc.moveDown(0.5);
            const openRequests = maintenance.filter((m) => m.status === 'Open').length;
            const closedRequests = maintenance.filter((m) => m.status === 'Closed').length;
            const totalCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
            doc.fontSize(12);
            doc.text(`Total Maintenance Requests: ${maintenance.length}`);
            doc.text(`Open Requests: ${openRequests}`, { fillColor: openRequests > 0 ? '#dc2626' : '#16a34a' });
            doc.text(`Closed Requests: ${closedRequests}`, { fillColor: '#16a34a' });
            doc.text(`Total Maintenance Cost: $${totalCost}`);
            doc.moveDown();
            doc.fontSize(14).fillColor('#2563eb').text('RECENT MAINTENANCE REQUESTS', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(10);
            maintenance.slice(0, 5).forEach((request, index) => {
                const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                doc.rect(40, doc.y - 2, 515, 25).fill(bgColor);
                doc.fillColor('#000000');
                doc.text(`${new Date(request.createdAt).toLocaleDateString()} - `, 50, doc.y + 2, { continued: true });
                doc.fillColor(request.status === 'Open' ? '#dc2626' : '#16a34a').text(request.status, { continued: true });
                doc.fillColor('#000000').text(` - ${request.description?.substring(0, 60)}${request.description?.length > 60 ? '...' : ''}`, 50, doc.y + 12);
                doc.y += 25;
            });
            doc.moveDown();
        }
        if (tenant.fatherName || tenant.motherName || tenant.presentAddress) {
            doc.fontSize(16).fillColor('#2563eb').text('PERSONAL DETAILS', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#000000');
            if (tenant.fatherName)
                doc.text(`Father's Name: ${tenant.fatherName}`);
            if (tenant.motherName)
                doc.text(`Mother's Name: ${tenant.motherName}`);
            if (tenant.govtIdNumber)
                doc.text(`Government ID: ${tenant.govtIdNumber}`);
            if (tenant.presentAddress)
                doc.text(`Present Address: ${tenant.presentAddress}`);
            if (tenant.permanentAddress)
                doc.text(`Permanent Address: ${tenant.permanentAddress}`);
            if (tenant.occupation)
                doc.text(`Occupation: ${tenant.occupation}`);
            if (tenant.monthlyIncome)
                doc.text(`Monthly Income: $${tenant.monthlyIncome}`);
            doc.moveDown();
        }
        if (tenant.emergencyContact?.name) {
            doc.fontSize(16).fillColor('#2563eb').text('EMERGENCY CONTACT', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#000000');
            const emergencyName = tenant.emergencyContact?.name;
            const emergencyPhone = tenant.emergencyContact?.phone;
            const emergencyRelation = tenant.emergencyContact?.relation;
            if (emergencyName)
                doc.text(`Name: ${emergencyName}`);
            if (emergencyPhone)
                doc.text(`Phone: ${emergencyPhone}`);
            if (emergencyRelation)
                doc.text(`Relationship: ${emergencyRelation}`);
            doc.moveDown();
        }
        if (tenant.vehicleDetails || tenant.petDetails || tenant.specialInstructions) {
            doc.fontSize(16).fillColor('#2563eb').text('ADDITIONAL INFORMATION', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#000000');
            if (tenant.vehicleDetails)
                doc.text(`Vehicle Details: ${tenant.vehicleDetails}`);
            if (tenant.petDetails)
                doc.text(`Pet Details: ${tenant.petDetails}`);
            if (tenant.numberOfOccupants)
                doc.text(`Number of Occupants: ${tenant.numberOfOccupants}`);
            if (tenant.specialInstructions) {
                doc.text('Special Instructions:', { continued: false });
                doc.text(tenant.specialInstructions, { width: 500 });
            }
            doc.moveDown();
        }
        doc.fontSize(8).fillColor('#6b7280');
        const footerY = doc.page.height - 60;
        doc.text('This document contains confidential tenant information. Unauthorized distribution is prohibited.', 40, footerY, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 40, footerY + 15, { align: 'center' });
        doc.text('Property Management System - Professional Tenant Management Solution', 40, footerY + 30, { align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
};
exports.downloadTenantPDF = downloadTenantPDF;
const downloadTenantDataZip = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenant = await Tenant_1.default.findById(req.params.id).populate('propertyId', 'name');
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-complete-data.zip"`);
        archive.pipe(res);
        const imageUrls = [
            { url: tenant.tenantImage || tenant.imageUrl, name: 'tenant-photo.jpg' },
            { url: tenant.govtIdFront, name: 'government-id-front.jpg' },
            { url: tenant.govtIdBack, name: 'government-id-back.jpg' }
        ];
        if (tenant.additionalAdults) {
            tenant.additionalAdults.forEach((adult, index) => {
                if (adult.imageUrl || adult.image) {
                    imageUrls.push({ url: adult.imageUrl || adult.image, name: `adult-${index + 1}-photo.jpg` });
                }
            });
        }
        for (const img of imageUrls) {
            if (img.url) {
                try {
                    const axios = require('axios');
                    const response = await axios.get(img.url, { responseType: 'stream' });
                    archive.append(response.data, { name: `images/${img.name}` });
                }
                catch (error) {
                    console.error(`Failed to download image ${img.url}:`, error);
                }
            }
        }
        if (tenant.documents && tenant.documents.length > 0) {
            for (const doc of tenant.documents) {
                try {
                    const axios = require('axios');
                    const response = await axios.get(doc.url, { responseType: 'stream' });
                    archive.append(response.data, { name: `documents/${doc.filename || 'document.pdf'}` });
                }
                catch (error) {
                    console.error(`Failed to download document ${doc.url}:`, error);
                }
            }
        }
        if (tenant.uploadedImages && tenant.uploadedImages.length > 0) {
            for (const img of tenant.uploadedImages) {
                try {
                    const axios = require('axios');
                    const response = await axios.get(img.url, { responseType: 'stream' });
                    archive.append(response.data, { name: `uploaded-images/${img.description || 'image'}.jpg` });
                }
                catch (error) {
                    console.error(`Failed to download uploaded image ${img.url}:`, error);
                }
            }
        }
        const PDFDocument = require('pdfkit');
        const pdfDoc = new PDFDocument({ margin: 40, size: 'A4' });
        pdfDoc.fontSize(20).text('COMPLETE TENANT INFORMATION', { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.fontSize(14).text(`Name: ${tenant.name}`);
        pdfDoc.text(`Email: ${tenant.email}`);
        pdfDoc.text(`Phone: ${tenant.phone}`);
        pdfDoc.text(`Property: ${tenant.propertyId?.name || 'N/A'}`);
        pdfDoc.text(`Unit: ${tenant.unit}`);
        pdfDoc.text(`Monthly Rent: $${tenant.rentAmount || 0}`);
        if (tenant.fatherName)
            pdfDoc.text(`Father's Name: ${tenant.fatherName}`);
        if (tenant.motherName)
            pdfDoc.text(`Mother's Name: ${tenant.motherName}`);
        if (tenant.presentAddress)
            pdfDoc.text(`Present Address: ${tenant.presentAddress}`);
        if (tenant.permanentAddress)
            pdfDoc.text(`Permanent Address: ${tenant.permanentAddress}`);
        pdfDoc.end();
        archive.append(pdfDoc, { name: 'tenant-complete-info.pdf' });
        const summaryText = `
TENANT SUMMARY
==============
Name: ${tenant.name}
Email: ${tenant.email}
Phone: ${tenant.phone}
Property: ${tenant.propertyId?.name || 'N/A'}
Unit: ${tenant.unit}
Status: ${tenant.status}
Monthly Rent: $${tenant.rentAmount || 0}
Security Deposit: $${tenant.securityDeposit || 0}
Lease Start: ${tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toLocaleDateString() : 'N/A'}
Lease End: ${tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}

Generated on: ${new Date().toLocaleString()}
`;
        archive.append(summaryText, { name: 'tenant-summary.txt' });
        archive.finalize();
    }
    catch (error) {
        console.error('Zip generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate zip file' });
    }
};
exports.downloadTenantDataZip = downloadTenantDataZip;
const searchTenants = async (req, res) => {
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
            status: { $ne: 'Archived' },
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } },
                { unit: { $regex: q, $options: 'i' } }
            ]
        };
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const managedProperties = await Property.find({
                organizationId: user.organizationId,
                managedByAgentId: user._id
            }).select('_id');
            const managedPropertyIds = managedProperties.map(p => p._id);
            query.propertyId = { $in: managedPropertyIds };
        }
        const tenants = await Tenant_1.default.find(query)
            .populate('propertyId', 'name address')
            .select('name email phone unit status rentAmount propertyId')
            .sort({ name: 1 })
            .limit(Math.min(50, parseInt(limit)))
            .lean();
        res.status(200).json({
            success: true,
            data: tenants.map(tenant => ({
                _id: tenant._id,
                name: tenant.name,
                email: tenant.email,
                phone: tenant.phone,
                unit: tenant.unit,
                status: tenant.status,
                rentAmount: tenant.rentAmount,
                property: tenant.propertyId
            }))
        });
    }
    catch (error) {
        console.error('Search tenants error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search tenants',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.searchTenants = searchTenants;
const getTenantSummary = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        let query = {
            organizationId: user.organizationId,
            status: { $ne: 'Archived' }
        };
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const managedProperties = await Property.find({
                organizationId: user.organizationId,
                managedByAgentId: user._id
            }).select('_id');
            const managedPropertyIds = managedProperties.map(p => p._id);
            query.propertyId = { $in: managedPropertyIds };
        }
        const [tenants, Payment] = await Promise.all([
            Tenant_1.default.find(query).lean(),
            Promise.resolve().then(() => __importStar(require('../models/Payment')))
        ]);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        const activeTenants = tenants.filter(t => t.status === 'Active');
        const lateTenants = tenants.filter(t => t.status === 'Late');
        const inactiveTenants = tenants.filter(t => t.status === 'Inactive');
        const expiringLeases = tenants.filter(t => t.leaseEndDate &&
            new Date(t.leaseEndDate) <= thirtyDaysFromNow &&
            new Date(t.leaseEndDate) >= now);
        const expiredLeases = tenants.filter(t => t.leaseEndDate && new Date(t.leaseEndDate) < now);
        const totalRent = activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
        const averageRent = activeTenants.length > 0 ? totalRent / activeTenants.length : 0;
        const statusDistribution = tenants.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            data: {
                tenants: {
                    total: tenants.length,
                    active: activeTenants.length,
                    late: lateTenants.length,
                    inactive: inactiveTenants.length
                },
                leases: {
                    expiring: expiringLeases.length,
                    expired: expiredLeases.length,
                    active: tenants.filter(t => !t.leaseEndDate || new Date(t.leaseEndDate) > thirtyDaysFromNow).length
                },
                financial: {
                    totalRent,
                    averageRent: Math.round(averageRent),
                    highestRent: Math.max(...tenants.map(t => t.rentAmount || 0)),
                    lowestRent: Math.min(...tenants.map(t => t.rentAmount || 0))
                },
                distributions: {
                    status: statusDistribution
                }
            }
        });
    }
    catch (error) {
        console.error('Get tenant summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tenant summary',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getTenantSummary = getTenantSummary;
const bulkTenantActions = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { action, tenantIds, data } = req.body;
        if (!action || !tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid request data' });
            return;
        }
        const tenants = await Tenant_1.default.find({
            _id: { $in: tenantIds },
            organizationId: user.organizationId
        });
        if (tenants.length !== tenantIds.length) {
            res.status(403).json({ success: false, message: 'Some tenants not found or not authorized' });
            return;
        }
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const propertyIds = [...new Set(tenants.map(t => t.propertyId.toString()))];
            const managedProperties = await Property.find({
                _id: { $in: propertyIds },
                managedByAgentId: user._id
            });
            if (managedProperties.length !== propertyIds.length) {
                res.status(403).json({ success: false, message: 'Agents can only perform bulk actions on tenants from properties they manage' });
                return;
            }
        }
        let results = [];
        let errors = [];
        switch (action) {
            case 'rent_increase':
                if (!data || !data.type || !data.value) {
                    res.status(400).json({ success: false, message: 'Rent increase requires type and value' });
                    return;
                }
                for (const tenant of tenants) {
                    try {
                        const oldAmount = tenant.rentAmount || 0;
                        const newAmount = data.type === 'percentage'
                            ? oldAmount * (1 + (data.value / 100))
                            : oldAmount + data.value;
                        await Tenant_1.default.findByIdAndUpdate(tenant._id, {
                            rentAmount: Math.round(newAmount),
                            lastRentIncrease: {
                                date: new Date(data.effectiveDate || Date.now()),
                                oldAmount,
                                newAmount: Math.round(newAmount),
                                type: data.type,
                                value: data.value,
                                reason: data.reason || 'Bulk rent increase'
                            }
                        });
                        results.push({ tenantId: tenant._id, oldAmount, newAmount: Math.round(newAmount) });
                    }
                    catch (error) {
                        errors.push({ tenantId: tenant._id, error: 'Failed to update rent' });
                    }
                }
                break;
            case 'update_status':
                if (!data || !data.status) {
                    res.status(400).json({ success: false, message: 'Status update requires new status' });
                    return;
                }
                const validStatuses = ['Active', 'Inactive', 'Late', 'Archived', 'Pending', 'Terminated'];
                if (!validStatuses.includes(data.status)) {
                    res.status(400).json({ success: false, message: 'Invalid status' });
                    return;
                }
                await Tenant_1.default.updateMany({ _id: { $in: tenantIds } }, { status: data.status });
                results = tenantIds.map(id => ({ tenantId: id, newStatus: data.status }));
                break;
            case 'archive_tenants':
                await Tenant_1.default.updateMany({ _id: { $in: tenantIds } }, { status: 'Archived' });
                results = tenantIds.map(id => ({ tenantId: id, status: 'archived' }));
                break;
            case 'restore_tenants':
                await Tenant_1.default.updateMany({ _id: { $in: tenantIds } }, { status: 'Active' });
                results = tenantIds.map(id => ({ tenantId: id, status: 'restored' }));
                break;
            default:
                res.status(400).json({ success: false, message: 'Unknown action' });
                return;
        }
        try {
            const AuditLog = await Promise.resolve().then(() => __importStar(require('../models/AuditLog')));
            await AuditLog.default.create({
                userId: user._id,
                organizationId: user.organizationId,
                action: `bulk_${action}`,
                resource: 'tenant',
                details: {
                    tenantCount: tenantIds.length,
                    action,
                    data,
                    results,
                    errors
                },
                timestamp: new Date()
            });
        }
        catch (logError) {
            console.error('Audit log error (non-critical):', logError);
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
        console.error('Bulk action error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.bulkTenantActions = bulkTenantActions;
const downloadPersonalDetailsPDF = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenant = await Tenant_1.default.findById(req.params.id).populate('propertyId', 'name');
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-personal-details.pdf"`);
        doc.pipe(res);
        doc.rect(0, 0, doc.page.width, 100).fill('#1e40af');
        doc.fontSize(32).fillColor('#ffffff').text('PERSONAL DETAILS', 40, 20, { align: 'center' });
        doc.fontSize(16).text('CONFIDENTIAL TENANT INFORMATION', 40, 55, { align: 'center' });
        doc.fontSize(10).text('Authorized Personnel Only', 40, 75, { align: 'center' });
        doc.fontSize(60).fillColor('#f3f4f6').text('CONFIDENTIAL', 0, 300, {
            align: 'center',
            angle: -45,
            opacity: 0.1
        });
        doc.y = 120;
        doc.fillColor('#000000');
        doc.fontSize(18).fillColor('#1e40af').text('TENANT IDENTIFICATION', { underline: true });
        doc.moveDown(0.5);
        doc.rect(40, doc.y, 120, 150).stroke('#d1d5db');
        doc.fontSize(10).fillColor('#6b7280').text('TENANT PHOTO', 70, doc.y + 70, { align: 'center' });
        doc.text('(Upload Required)', 70, doc.y + 85, { align: 'center' });
        const photoRightX = 180;
        const basicInfoY = doc.y - 150;
        doc.fontSize(14).fillColor('#1e40af').text('BASIC INFORMATION', photoRightX, basicInfoY, { underline: true });
        doc.fontSize(12).fillColor('#000000');
        doc.text(`Full Name: ${tenant.name}`, photoRightX, basicInfoY + 25);
        doc.text(`Email: ${tenant.email}`, photoRightX, basicInfoY + 45);
        doc.text(`Phone: ${tenant.phone}`, photoRightX, basicInfoY + 65);
        if (tenant.whatsappNumber) {
            doc.text(`WhatsApp: ${tenant.whatsappNumber}`, photoRightX, basicInfoY + 85);
        }
        doc.text(`Status: ${tenant.status}`, photoRightX, basicInfoY + 105, {
            fillColor: tenant.status === 'Active' ? '#16a34a' : '#dc2626'
        });
        doc.y = basicInfoY + 170;
        doc.moveDown();
        doc.fontSize(16).fillColor('#1e40af').text('PROPERTY INFORMATION', { underline: true });
        doc.moveDown(0.5);
        const leftCol = 60;
        const rightCol = 320;
        let currentY = doc.y;
        doc.fontSize(12).fillColor('#000000');
        doc.text('Property:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.propertyId?.name || 'N/A'}`);
        doc.font('Helvetica').text('Unit Number:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.unit}`);
        doc.font('Helvetica').text('Monthly Rent:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').fillColor('#16a34a').text(` $${tenant.rentAmount || 0}`);
        doc.fillColor('#000000').font('Helvetica').text('Security Deposit:', rightCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` $${tenant.securityDeposit || 0}`);
        if (tenant.leaseStartDate) {
            doc.text('Lease Start:', leftCol, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${new Date(tenant.leaseStartDate).toLocaleDateString()}`);
        }
        if (tenant.leaseEndDate) {
            doc.font('Helvetica').text('Lease End:', rightCol, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${new Date(tenant.leaseEndDate).toLocaleDateString()}`);
        }
        doc.y = currentY + 80;
        doc.moveDown();
        doc.fontSize(16).fillColor('#1e40af').text('FAMILY DETAILS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        currentY = doc.y;
        if (tenant.fatherName) {
            doc.text('Father\'s Name:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.fatherName}`);
        }
        if (tenant.motherName) {
            doc.font('Helvetica').text('Mother\'s Name:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.motherName}`);
        }
        if (tenant.govtIdNumber) {
            doc.font('Helvetica').text('Government ID:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.govtIdNumber}`);
        }
        if (tenant.occupation) {
            doc.font('Helvetica').text('Occupation:', rightCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.occupation}`);
        }
        if (tenant.monthlyIncome) {
            doc.font('Helvetica').text('Monthly Income:', leftCol, currentY + 40, { continued: true }).font('Helvetica-Bold').fillColor('#16a34a').text(` $${tenant.monthlyIncome}`);
        }
        doc.y = currentY + 80;
        doc.moveDown();
        doc.fontSize(16).fillColor('#1e40af').text('ADDRESS INFORMATION', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        if (tenant.presentAddress) {
            doc.text('Present Address:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.presentAddress}`, { width: 500 });
            doc.moveDown(0.3);
        }
        if (tenant.permanentAddress) {
            doc.font('Helvetica').text('Permanent Address:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.permanentAddress}`, { width: 500 });
            doc.moveDown(0.3);
        }
        if (tenant.previousAddress) {
            doc.font('Helvetica').text('Previous Address:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.previousAddress}`, { width: 500 });
            doc.moveDown(0.3);
        }
        doc.moveDown();
        const emergencyName = tenant.emergencyContact?.name;
        const emergencyPhone = tenant.emergencyContact?.phone;
        const emergencyRelation = tenant.emergencyContact?.relation;
        if (emergencyName || emergencyPhone) {
            doc.fontSize(16).fillColor('#1e40af').text('EMERGENCY CONTACT', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#000000').font('Helvetica');
            currentY = doc.y;
            if (emergencyName) {
                doc.text('Contact Name:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${emergencyName}`);
            }
            if (emergencyPhone) {
                doc.font('Helvetica').text('Phone Number:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${emergencyPhone}`);
            }
            if (emergencyRelation) {
                doc.font('Helvetica').text('Relationship:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${emergencyRelation}`);
            }
            doc.y = currentY + 60;
            doc.moveDown();
        }
        if (tenant.reference?.name) {
            doc.fontSize(16).fillColor('#1e40af').text('REFERENCE INFORMATION', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#000000').font('Helvetica');
            const refName = tenant.reference?.name;
            const refPhone = tenant.reference?.phone;
            const refEmail = tenant.reference?.email;
            const refRelation = tenant.reference?.relation;
            const refAddress = tenant.reference?.address;
            currentY = doc.y;
            if (refName) {
                doc.text('Reference Name:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${refName}`);
            }
            if (refPhone) {
                doc.font('Helvetica').text('Phone:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${refPhone}`);
            }
            if (refEmail) {
                doc.font('Helvetica').text('Email:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${refEmail}`);
            }
            if (refRelation) {
                doc.font('Helvetica').text('Relation:', rightCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${refRelation}`);
            }
            if (refAddress) {
                doc.font('Helvetica').text('Address:', leftCol, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${refAddress}`, { width: 400 });
            }
            doc.y = currentY + 80;
            doc.moveDown();
        }
        if (tenant.vehicleDetails || tenant.petDetails || tenant.specialInstructions || tenant.numberOfOccupants) {
            doc.fontSize(16).fillColor('#1e40af').text('ADDITIONAL INFORMATION', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#000000').font('Helvetica');
            if (tenant.numberOfOccupants) {
                doc.text('Number of Occupants:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.numberOfOccupants}`);
            }
            if (tenant.vehicleDetails) {
                doc.font('Helvetica').text('Vehicle Details:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.vehicleDetails}`);
            }
            if (tenant.petDetails) {
                doc.font('Helvetica').text('Pet Details:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.petDetails}`);
            }
            if (tenant.reasonForMoving) {
                doc.font('Helvetica').text('Reason for Moving:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.reasonForMoving}`, { width: 500 });
            }
            if (tenant.specialInstructions) {
                doc.font('Helvetica').text('Special Instructions:', { continued: false });
                doc.font('Helvetica-Bold').text(tenant.specialInstructions, { width: 500 });
            }
            doc.moveDown();
        }
        if (tenant.additionalAdults && tenant.additionalAdults.length > 0) {
            doc.fontSize(16).fillColor('#1e40af').text('ADDITIONAL OCCUPANTS', { underline: true });
            doc.moveDown(0.5);
            tenant.additionalAdults.forEach((adult, index) => {
                doc.fontSize(14).fillColor('#374151').text(`Adult ${index + 1}:`, { underline: true });
                doc.fontSize(12).fillColor('#000000').font('Helvetica');
                if (adult.name)
                    doc.text(`Name: ${adult.name}`);
                if (adult.phone)
                    doc.text(`Phone: ${adult.phone}`);
                if (adult.govtIdNumber)
                    doc.text(`Government ID: ${adult.govtIdNumber}`);
                if (adult.relation)
                    doc.text(`Relation to Main Tenant: ${adult.relation}`);
                doc.moveDown(0.5);
            });
        }
        doc.rect(40, doc.y, 515, 60).fill('#fef3c7').stroke('#f59e0b');
        doc.fontSize(12).fillColor('#92400e').text('SECURITY NOTICE', 50, doc.y + 10, { align: 'center' });
        doc.fontSize(10).text('This document contains sensitive personal information.', 50, doc.y + 25, { align: 'center' });
        doc.text('Handle with care and dispose of securely when no longer needed.', 50, doc.y + 40, { align: 'center' });
        doc.y += 80;
        doc.moveDown();
        doc.fontSize(8).fillColor('#6b7280');
        const footerY = doc.page.height - 80;
        doc.rect(0, footerY - 10, doc.page.width, 90).fill('#f9fafb');
        doc.text('CONFIDENTIAL DOCUMENT - AUTHORIZED PERSONNEL ONLY', 40, footerY, { align: 'center' });
        doc.text('This document contains confidential tenant information protected by privacy laws.', 40, footerY + 15, { align: 'center' });
        doc.text('Unauthorized access, distribution, or disclosure is strictly prohibited.', 40, footerY + 30, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 40, footerY + 50, { align: 'center' });
        doc.text('Property Management System - Professional Tenant Management Solution', 40, footerY + 65, { align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error('Personal details PDF generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate personal details PDF' });
    }
};
exports.downloadPersonalDetailsPDF = downloadPersonalDetailsPDF;
