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
exports.deleteMaintenanceRequest = exports.getMaintenanceRequestById = exports.updateMaintenanceRequest = exports.getMaintenanceRequests = exports.createMaintenanceRequest = exports.bulkMaintenanceActions = exports.getMaintenanceSummary = exports.searchMaintenanceRequests = void 0;
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Property_1 = __importDefault(require("../models/Property"));
const searchMaintenanceRequests = async (req, res) => {
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
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } }
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
        const requests = await MaintenanceRequest_1.default.find(query)
            .populate('propertyId', 'name address')
            .populate('tenantId', 'name unit')
            .select('title description status priority category location createdAt propertyId tenantId')
            .sort({ createdAt: -1 })
            .limit(Math.min(50, parseInt(limit)))
            .lean();
        res.status(200).json({
            success: true,
            data: requests.map(request => ({
                _id: request._id,
                title: request.title,
                description: request.description,
                status: request.status,
                priority: request.priority,
                category: request.category,
                location: request.location,
                createdAt: request.createdAt,
                property: request.propertyId,
                tenant: request.tenantId
            }))
        });
    }
    catch (error) {
        console.error('Search maintenance requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search maintenance requests',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.searchMaintenanceRequests = searchMaintenanceRequests;
const getMaintenanceSummary = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        let query = { organizationId: user.organizationId };
        if (user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const managedProperties = await Property.find({
                organizationId: user.organizationId,
                managedByAgentId: user._id
            }).select('_id');
            const managedPropertyIds = managedProperties.map(p => p._id);
            query.propertyId = { $in: managedPropertyIds };
        }
        const [requests, currentMonth, lastMonth] = await Promise.all([
            MaintenanceRequest_1.default.find(query).lean(),
            MaintenanceRequest_1.default.find({
                ...query,
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                }
            }).lean(),
            MaintenanceRequest_1.default.find({
                ...query,
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }).lean()
        ]);
        const totalRequests = requests.length;
        const openRequests = requests.filter(r => r.status === 'Open');
        const inProgressRequests = requests.filter(r => r.status === 'In Progress');
        const completedRequests = requests.filter(r => r.status === 'Completed');
        const overdueRequests = requests.filter(r => r.dueDate && new Date() > new Date(r.dueDate) && r.status !== 'Completed');
        const totalCost = requests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);
        const avgResolutionTime = completedRequests.length > 0 ?
            completedRequests.reduce((sum, r) => {
                if (r.completedAt && r.createdAt) {
                    return sum + (new Date(r.completedAt).getTime() - new Date(r.createdAt).getTime());
                }
                return sum;
            }, 0) / completedRequests.length / (1000 * 60 * 60 * 24) : 0;
        const statusDistribution = requests.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {});
        const priorityDistribution = requests.reduce((acc, r) => {
            acc[r.priority] = (acc[r.priority] || 0) + 1;
            return acc;
        }, {});
        const categoryDistribution = requests.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
        }, {});
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalRequests,
                    openCount: openRequests.length,
                    inProgressCount: inProgressRequests.length,
                    completedCount: completedRequests.length,
                    overdueCount: overdueRequests.length,
                    completionRate: totalRequests > 0 ? Math.round((completedRequests.length / totalRequests) * 100) : 0
                },
                costs: {
                    totalCost,
                    averageCost: totalRequests > 0 ? Math.round(totalCost / totalRequests) : 0,
                    estimatedPending: openRequests.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
                },
                performance: {
                    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
                    currentMonthRequests: currentMonth.length,
                    lastMonthRequests: lastMonth.length,
                    monthlyGrowth: lastMonth.length > 0 ? Math.round(((currentMonth.length - lastMonth.length) / lastMonth.length) * 100) : 0
                },
                distributions: {
                    status: statusDistribution,
                    priority: priorityDistribution,
                    category: categoryDistribution
                }
            }
        });
    }
    catch (error) {
        console.error('Get maintenance summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch maintenance summary',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getMaintenanceSummary = getMaintenanceSummary;
const bulkMaintenanceActions = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { action, requestIds, data } = req.body;
        if (!action || !requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid request data' });
            return;
        }
        const requests = await MaintenanceRequest_1.default.find({
            _id: { $in: requestIds },
            organizationId: user.organizationId
        });
        if (requests.length !== requestIds.length) {
            res.status(403).json({ success: false, message: 'Some requests not found or not authorized' });
            return;
        }
        let results = [];
        let errors = [];
        switch (action) {
            case 'update_status':
                if (!data || !data.status) {
                    res.status(400).json({ success: false, message: 'Status update requires new status' });
                    return;
                }
                const validStatuses = ['Open', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Rejected'];
                if (!validStatuses.includes(data.status)) {
                    res.status(400).json({ success: false, message: 'Invalid status' });
                    return;
                }
                await MaintenanceRequest_1.default.updateMany({ _id: { $in: requestIds } }, { status: data.status });
                results = requestIds.map(id => ({ requestId: id, newStatus: data.status }));
                break;
            case 'assign_requests':
                if (!data || !data.assignedTo) {
                    res.status(400).json({ success: false, message: 'Assignment requires assignedTo user ID' });
                    return;
                }
                await MaintenanceRequest_1.default.updateMany({ _id: { $in: requestIds } }, { assignedTo: data.assignedTo, status: 'Assigned' });
                results = requestIds.map(id => ({ requestId: id, assignedTo: data.assignedTo }));
                break;
            case 'update_priority':
                if (!data || !data.priority) {
                    res.status(400).json({ success: false, message: 'Priority update requires new priority' });
                    return;
                }
                const validPriorities = ['Low', 'Medium', 'High', 'Urgent', 'Emergency'];
                if (!validPriorities.includes(data.priority)) {
                    res.status(400).json({ success: false, message: 'Invalid priority' });
                    return;
                }
                await MaintenanceRequest_1.default.updateMany({ _id: { $in: requestIds } }, { priority: data.priority });
                results = requestIds.map(id => ({ requestId: id, newPriority: data.priority }));
                break;
            default:
                res.status(400).json({ success: false, message: 'Unknown action' });
                return;
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
        console.error('Bulk maintenance action error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.bulkMaintenanceActions = bulkMaintenanceActions;
const createMaintenanceRequest = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId, tenantId, title, description, priority, category, location, estimatedCost, dueDate, scheduledDate } = req.body;
        const requiredFields = { propertyId, title, description, category };
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
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Invalid property or property not found'
            });
            return;
        }
        if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Agents can only create requests for properties they manage'
            });
            return;
        }
        if (tenantId) {
            const Tenant = require('../models/Tenant').default;
            const tenant = await Tenant.findById(tenantId);
            if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid tenant'
                });
                return;
            }
        }
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            const usageCheck = await subscriptionService.checkUsageLimit(user.organizationId, 'tenants');
            if (!usageCheck.allowed) {
                res.status(403).json({
                    success: false,
                    message: 'Maintenance request limit exceeded',
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
        const requestData = {
            organizationId: user.organizationId,
            propertyId,
            tenantId: tenantId || undefined,
            title: title.trim(),
            description: description.trim(),
            priority: priority || 'Medium',
            category,
            location: location ? location.trim() : undefined,
            requestedBy: user._id,
            status: 'Open'
        };
        if (estimatedCost && !isNaN(parseFloat(estimatedCost))) {
            requestData.estimatedCost = parseFloat(estimatedCost);
        }
        if (dueDate) {
            const dueDateObj = new Date(dueDate);
            if (!isNaN(dueDateObj.getTime()) && dueDateObj >= new Date()) {
                requestData.dueDate = dueDateObj;
            }
        }
        if (scheduledDate) {
            const scheduledDateObj = new Date(scheduledDate);
            if (!isNaN(scheduledDateObj.getTime()) && scheduledDateObj >= new Date()) {
                requestData.scheduledDate = scheduledDateObj;
            }
        }
        if (req.body.notes) {
            requestData.notes = req.body.notes.trim();
        }
        if (req.body.urgencyLevel && !isNaN(parseInt(req.body.urgencyLevel))) {
            const urgency = parseInt(req.body.urgencyLevel);
            if (urgency >= 1 && urgency <= 10) {
                requestData.urgencyLevel = urgency;
            }
        }
        console.log('Creating maintenance request:', {
            propertyId,
            title: requestData.title,
            category: requestData.category,
            priority: requestData.priority
        });
        const newRequest = await MaintenanceRequest_1.default.create(requestData);
        try {
            const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
            await subscriptionService.updateUsage(user.organizationId, 'tenants', 1);
        }
        catch (usageError) {
            console.error('Usage update error:', usageError);
        }
        const populatedRequest = await MaintenanceRequest_1.default.findById(newRequest._id)
            .populate('propertyId', 'name address')
            .populate('tenantId', 'name unit email')
            .populate('requestedBy', 'name email')
            .lean();
        res.status(201).json({
            success: true,
            data: populatedRequest,
            message: 'Maintenance request created successfully'
        });
    }
    catch (error) {
        console.error('Create maintenance request error:', error);
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
            message: 'Failed to create maintenance request',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.createMaintenanceRequest = createMaintenanceRequest;
const getMaintenanceRequests = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { page = 1, limit = 50, status, priority, category, propertyId, tenantId, assignedTo, search, sortBy = 'createdAt', sortOrder = 'desc', overdue = 'false', startDate, endDate } = req.query;
        let query = { organizationId: user.organizationId };
        if (status && status !== 'all') {
            query.status = status;
        }
        if (priority && priority !== 'all') {
            query.priority = priority;
        }
        if (category && category !== 'all') {
            query.category = category;
        }
        if (propertyId) {
            query.propertyId = propertyId;
        }
        if (tenantId) {
            query.tenantId = tenantId;
        }
        if (assignedTo) {
            query.assignedTo = assignedTo;
        }
        if (overdue === 'true') {
            query.dueDate = { $lt: new Date() };
            query.status = { $nin: ['Completed', 'Cancelled'] };
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
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
        const [requests, totalCount] = await Promise.all([
            MaintenanceRequest_1.default.find(query)
                .populate('propertyId', 'name address')
                .populate('tenantId', 'name unit email phone')
                .populate('assignedTo', 'name email')
                .populate('requestedBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean()
                .exec(),
            MaintenanceRequest_1.default.countDocuments(query)
        ]);
        const openCount = requests.filter(r => r.status === 'Open').length;
        const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
        const completedCount = requests.filter(r => r.status === 'Completed').length;
        const overdueCount = requests.filter(r => r.dueDate && new Date() > new Date(r.dueDate) && r.status !== 'Completed').length;
        res.status(200).json({
            success: true,
            data: requests,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalCount,
                hasNext: pageNum < Math.ceil(totalCount / limitNum),
                hasPrev: pageNum > 1
            },
            summary: {
                totalRequests: totalCount,
                openCount,
                inProgressCount,
                completedCount,
                overdueCount
            }
        });
    }
    catch (error) {
        console.error('Get maintenance requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch maintenance requests',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
exports.getMaintenanceRequests = getMaintenanceRequests;
const updateMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const request = await MaintenanceRequest_1.default.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        const updatedRequest = await MaintenanceRequest_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedRequest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateMaintenanceRequest = updateMaintenanceRequest;
const getMaintenanceRequestById = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const request = await MaintenanceRequest_1.default.findById(req.params.id)
            .populate('propertyId', 'name address')
            .populate('tenantId', 'name email phone unit')
            .populate('requestedBy', 'name email')
            .populate('organizationId', 'name');
        if (!request) {
            return res.status(404).json({ success: false, message: 'Maintenance request not found' });
        }
        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
        }
        res.status(200).json({ success: true, data: request });
    }
    catch (error) {
        console.error('Get maintenance request by ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMaintenanceRequestById = getMaintenanceRequestById;
const deleteMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const request = await MaintenanceRequest_1.default.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        await request.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteMaintenanceRequest = deleteMaintenanceRequest;
