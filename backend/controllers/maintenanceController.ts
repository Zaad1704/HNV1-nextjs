import { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
}

// Search maintenance requests
export const searchMaintenanceRequests = async (req: AuthRequest, res: Response) => {
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

    let query: any = {
      organizationId: user.organizationId,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ]
    };

    // Agents see only requests from properties they manage
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const managedProperties = await Property.find({
        organizationId: user.organizationId,
        managedByAgentId: user._id
      }).select('_id');
      
      const managedPropertyIds = managedProperties.map(p => p._id);
      query.propertyId = { $in: managedPropertyIds };
    }

    const requests = await MaintenanceRequest.find(query)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'name unit')
      .select('title description status priority category location createdAt propertyId tenantId')
      .sort({ createdAt: -1 })
      .limit(Math.min(50, parseInt(limit as string)))
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
  } catch (error: any) {
    console.error('Search maintenance requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search maintenance requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get maintenance summary
export const getMaintenanceSummary = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    let query: any = { organizationId: user.organizationId };
    
    // Agents see only requests from properties they manage
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
      MaintenanceRequest.find(query).lean(),
      MaintenanceRequest.find({
        ...query,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }).lean(),
      MaintenanceRequest.find({
        ...query,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }).lean()
    ]);

    // Calculate statistics
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

    // Status distribution
    const statusDistribution = requests.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    // Priority distribution
    const priorityDistribution = requests.reduce((acc: any, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryDistribution = requests.reduce((acc: any, r) => {
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
  } catch (error: any) {
    console.error('Get maintenance summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch maintenance summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk maintenance actions
export const bulkMaintenanceActions = async (req: AuthRequest, res: Response) => {
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

    // Verify all requests belong to the organization
    const requests = await MaintenanceRequest.find({
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
        
        await MaintenanceRequest.updateMany(
          { _id: { $in: requestIds } },
          { status: data.status }
        );
        results = requestIds.map(id => ({ requestId: id, newStatus: data.status }));
        break;

      case 'assign_requests':
        if (!data || !data.assignedTo) {
          res.status(400).json({ success: false, message: 'Assignment requires assignedTo user ID' });
          return;
        }
        
        await MaintenanceRequest.updateMany(
          { _id: { $in: requestIds } },
          { assignedTo: data.assignedTo, status: 'Assigned' }
        );
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
        
        await MaintenanceRequest.updateMany(
          { _id: { $in: requestIds } },
          { priority: data.priority }
        );
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
  } catch (error: any) {
    console.error('Bulk maintenance action error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to perform bulk action',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId, tenantId, title, description, priority, category, location, estimatedCost, dueDate, scheduledDate } = req.body;

    // Validate required fields
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

    // Verify property exists and belongs to organization
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ 
        success: false, 
        message: 'Invalid property or property not found' 
      });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent' && property.managedByAgentId?.toString() !== user._id.toString()) {
      res.status(403).json({ 
        success: false, 
        message: 'Agents can only create requests for properties they manage' 
      });
      return;
    }

    // Verify tenant if provided
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

    // Check subscription limits
    try {
      const subscriptionService = (await import('../services/subscriptionService')).default;
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
    } catch (subscriptionError) {
      console.error('Subscription check error:', subscriptionError);
    }

    // Prepare request data
    const requestData: any = {
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

    // Add optional fields
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

    const newRequest = await MaintenanceRequest.create(requestData);

    // Update subscription usage
    try {
      const subscriptionService = (await import('../services/subscriptionService')).default;
      await subscriptionService.updateUsage(user.organizationId, 'tenants', 1);
    } catch (usageError) {
      console.error('Usage update error:', usageError);
    }

    // Populate response data
    const populatedRequest = await MaintenanceRequest.findById(newRequest._id)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'name unit email')
      .populate('requestedBy', 'name email')
      .lean();

    res.status(201).json({ 
      success: true, 
      data: populatedRequest,
      message: 'Maintenance request created successfully'
    });
  } catch (error: any) {
    console.error('Create maintenance request error:', error);
    
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
      message: 'Failed to create maintenance request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getMaintenanceRequests = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      priority,
      category,
      propertyId, 
      tenantId,
      assignedTo,
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      overdue = 'false',
      startDate,
      endDate
    } = req.query;

    let query: any = { organizationId: user.organizationId };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by property
    if (propertyId) {
      query.propertyId = propertyId;
    }
    
    // Filter by tenant
    if (tenantId) {
      query.tenantId = tenantId;
    }
    
    // Filter by assigned user
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    
    // Filter overdue requests
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: ['Completed', 'Cancelled'] };
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Agents see only requests from properties they manage
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const managedProperties = await Property.find({
        organizationId: user.organizationId,
        managedByAgentId: user._id
      }).select('_id');
      
      const managedPropertyIds = managedProperties.map(p => p._id);
      query.propertyId = { $in: managedPropertyIds };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [requests, totalCount] = await Promise.all([
      MaintenanceRequest.find(query)
        .populate('propertyId', 'name address')
        .populate('tenantId', 'name unit email phone')
        .populate('assignedTo', 'name email')
        .populate('requestedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      MaintenanceRequest.countDocuments(query)
    ]);

    // Calculate summary statistics
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
  } catch (error: any) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch maintenance requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMaintenanceRequestById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'name email phone unit')
      .populate('requestedBy', 'name email')
      .populate('organizationId', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Check authorization
    if (request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Get maintenance request by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await request.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};