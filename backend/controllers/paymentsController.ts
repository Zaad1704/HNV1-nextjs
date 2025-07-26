import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import Invoice from '../models/Invoice';
import actionChainService from '../services/actionChainService';

interface AuthRequest extends Request {
  user?: any;
}

// Search payments
export const searchPayments = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || (!user.organizationId && user.role !== 'Super Admin')) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
      return;
    }

    let query: any = user.role === 'Super Admin' && !user.organizationId 
      ? {} 
      : { organizationId: user.organizationId };
    
    query.$or = [
      { description: { $regex: q, $options: 'i' } },
      { notes: { $regex: q, $options: 'i' } },
      { referenceNumber: { $regex: q, $options: 'i' } },
      { transactionId: { $regex: q, $options: 'i' } },
      { receiptNumber: { $regex: q, $options: 'i' } }
    ];

    // Agents see only payments from properties they manage
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const managedProperties = await Property.find({
        organizationId: user.organizationId,
        managedByAgentId: user._id
      }).select('_id');
      
      const managedPropertyIds = managedProperties.map(p => p._id);
      query.propertyId = { $in: managedPropertyIds };
    }

    const payments = await Payment.find(query)
      .populate('tenantId', 'name unit')
      .populate('propertyId', 'name address')
      .select('amount status paymentDate paymentMethod description tenantId propertyId')
      .sort({ paymentDate: -1 })
      .limit(Math.min(50, parseInt(limit as string)))
      .lean();

    res.status(200).json({
      success: true,
      data: payments.map(payment => ({
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        description: payment.description,
        tenant: payment.tenantId,
        property: payment.propertyId
      }))
    });
  } catch (error: any) {
    console.error('Search payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search payments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get payment summary statistics
export const getPaymentSummary = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || (!user.organizationId && user.role !== 'Super Admin')) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    let query: any = user.role === 'Super Admin' && !user.organizationId 
      ? {} 
      : { organizationId: user.organizationId };
    
    // Agents see only payments from properties they manage
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const managedProperties = await Property.find({
        organizationId: user.organizationId,
        managedByAgentId: user._id
      }).select('_id');
      
      const managedPropertyIds = managedProperties.map(p => p._id);
      query.propertyId = { $in: managedPropertyIds };
    }

    const [payments, currentMonth, lastMonth] = await Promise.all([
      Payment.find(query).lean(),
      Payment.find({
        ...query,
        paymentDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }).lean(),
      Payment.find({
        ...query,
        paymentDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }).lean()
    ]);

    // Calculate statistics
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidPayments = payments.filter(p => p.status === 'Paid');
    const pendingPayments = payments.filter(p => p.status === 'Pending');
    const failedPayments = payments.filter(p => p.status === 'Failed');
    
    const currentMonthAmount = currentMonth.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastMonthAmount = lastMonth.reduce((sum, p) => sum + (p.amount || 0), 0);
    const monthlyGrowth = lastMonthAmount > 0 ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;

    // Status distribution
    const statusDistribution = payments.reduce((acc: any, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    // Payment method distribution
    const methodDistribution = payments.reduce((acc: any, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalPayments,
          totalAmount,
          averageAmount: totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0,
          paidCount: paidPayments.length,
          pendingCount: pendingPayments.length,
          failedCount: failedPayments.length
        },
        monthly: {
          currentMonth: currentMonthAmount,
          lastMonth: lastMonthAmount,
          growth: Math.round(monthlyGrowth * 100) / 100,
          currentMonthCount: currentMonth.length,
          lastMonthCount: lastMonth.length
        },
        distributions: {
          status: statusDistribution,
          paymentMethod: methodDistribution
        },
        amounts: {
          paid: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          pending: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          failed: failedPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
        }
      }
    });
  } catch (error: any) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || (!user.organizationId && user.role !== 'Super Admin')) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { range = '12months' } = req.query;

    let query: any = user.role === 'Super Admin' && !user.organizationId 
      ? {} 
      : { organizationId: user.organizationId };
    
    // Agents see only payments from properties they manage
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const managedProperties = await Property.find({
        organizationId: user.organizationId,
        managedByAgentId: user._id
      }).select('_id');
      
      const managedPropertyIds = managedProperties.map(p => p._id);
      query.propertyId = { $in: managedPropertyIds };
    }

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

    const payments = await Payment.find({
      ...query,
      paymentDate: { $gte: startDate, $lte: endDate }
    }).lean();

    // Generate monthly data
    const monthlyData = [];
    const months = range === '3months' ? 3 : range === '6months' ? 6 : 12;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      });
      
      const paidPayments = monthPayments.filter(p => p.status === 'Paid');
      const pendingPayments = monthPayments.filter(p => p.status === 'Pending');
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        total: monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        paid: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        pending: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        count: monthPayments.length,
        paidCount: paidPayments.length,
        pendingCount: pendingPayments.length
      });
    }

    // Calculate trends
    const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);
    const collectionRate = payments.length > 0 ? (payments.filter(p => p.status === 'Paid').length / payments.length) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        monthlyData,
        totals: {
          revenue: totalRevenue,
          pending: totalPending,
          paymentCount: payments.length,
          collectionRate: Math.round(collectionRate * 100) / 100
        },
        trends: {
          averageMonthlyRevenue: Math.round(totalRevenue / months),
          peakMonth: monthlyData.reduce((max, month) => month.paid > max.paid ? month : max, monthlyData[0] || {}),
          lowestMonth: monthlyData.reduce((min, month) => month.paid < min.paid ? month : min, monthlyData[0] || {})
        }
      }
    });
  } catch (error: any) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk payment operations
export const bulkPaymentActions = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { action, paymentIds, data } = req.body;

    if (!action || !paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid request data' });
      return;
    }

    // Verify all payments belong to the organization
    const payments = await Payment.find({
      _id: { $in: paymentIds },
      organizationId: user.organizationId
    });

    if (payments.length !== paymentIds.length) {
      res.status(403).json({ success: false, message: 'Some payments not found or not authorized' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const propertyIds = [...new Set(payments.map(p => p.propertyId.toString()))];
      const managedProperties = await Property.find({
        _id: { $in: propertyIds },
        managedByAgentId: user._id
      });
      
      if (managedProperties.length !== propertyIds.length) {
        res.status(403).json({ success: false, message: 'Agents can only perform bulk actions on payments from properties they manage' });
        return;
      }
    }

    let results = [];
    let errors = [];

    switch (action) {
      case 'update_status':
        if (!data || !data.status) {
          res.status(400).json({ success: false, message: 'Status update requires new status' });
          return;
        }
        
        const validStatuses = ['Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded', 'Partial'];
        if (!validStatuses.includes(data.status)) {
          res.status(400).json({ success: false, message: 'Invalid status' });
          return;
        }
        
        await Payment.updateMany(
          { _id: { $in: paymentIds } },
          { status: data.status }
        );
        results = paymentIds.map(id => ({ paymentId: id, newStatus: data.status }));
        break;

      case 'add_notes':
        if (!data || !data.notes) {
          res.status(400).json({ success: false, message: 'Notes are required' });
          return;
        }
        
        await Payment.updateMany(
          { _id: { $in: paymentIds } },
          { $set: { notes: data.notes } }
        );
        results = paymentIds.map(id => ({ paymentId: id, notesAdded: true }));
        break;

      case 'delete_payments':
        if (user.role === 'Agent') {
          res.status(403).json({ success: false, message: 'Agents cannot delete payments' });
          return;
        }
        
        await Payment.deleteMany({ _id: { $in: paymentIds } });
        results = paymentIds.map(id => ({ paymentId: id, deleted: true }));
        break;

      default:
        res.status(400).json({ success: false, message: 'Unknown action' });
        return;
    }

    // Log the bulk action
    try {
      const AuditLog = await import('../models/AuditLog');
      await AuditLog.default.create({
        userId: user._id,
        organizationId: user.organizationId,
        action: `bulk_${action}`,
        resource: 'payment',
        details: {
          paymentCount: paymentIds.length,
          action,
          data,
          results,
          errors
        },
        timestamp: new Date()
      });
    } catch (logError) {
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
  } catch (error: any) {
    console.error('Bulk payment action error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to perform bulk action',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || (!user.organizationId && user.role !== 'Super Admin')) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      propertyId, 
      tenantId,
      paymentMethod,
      search, 
      sortBy = 'paymentDate', 
      sortOrder = 'desc',
      startDate,
      endDate,
      rentMonth
    } = req.query;

    let query: any = user.role === 'Super Admin' && !user.organizationId 
      ? {} 
      : { organizationId: user.organizationId };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by property
    if (propertyId) {
      query.propertyId = propertyId;
    }
    
    // Filter by tenant
    if (tenantId) {
      query.tenantId = tenantId;
    }
    
    // Filter by payment method
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    // Filter by rent month
    if (rentMonth) {
      query.rentMonth = rentMonth;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        query.paymentDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.paymentDate.$lte = new Date(endDate as string);
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Agents see only payments from properties they manage
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
    const [payments, totalCount] = await Promise.all([
      Payment.find(query)
        .populate('tenantId', 'name email unit imageUrl tenantImage')
        .populate('propertyId', 'name address imageUrl')
        .populate('recordedBy', 'name email')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Payment.countDocuments(query)
    ]);

    // Calculate summary statistics
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const paidAmount = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    res.status(200).json({ 
      success: true, 
      data: payments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      },
      summary: {
        totalPayments: totalCount,
        totalAmount,
        paidAmount,
        pendingAmount,
        averageAmount: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0
      }
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { tenantId, amount, paymentDate, status, paymentMethod, description, notes, rentMonth } = req.body;

    // Validate required fields
    const requiredFields = { tenantId, amount, paymentDate };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Amount must be a valid positive number' 
      });
      return;
    }

    // Validate payment date
    const paymentDateObj = new Date(paymentDate);
    if (isNaN(paymentDateObj.getTime())) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment date' 
      });
      return;
    }

    // Verify tenant exists and belongs to organization
    const tenant = await Tenant.findById(tenantId);
    if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Tenant not found in your organization' });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const property = await Property.findById(tenant.propertyId);
      
      if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
        res.status(403).json({ 
          success: false, 
          message: 'Agents can only create payments for properties they manage' 
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
          message: 'Payment limit exceeded',
          reason: usageCheck.reason,
          currentUsage: usageCheck.currentUsage,
          limit: usageCheck.limit
        });
        return;
      }
    } catch (subscriptionError) {
      console.error('Subscription check error:', subscriptionError);
      // Continue without failing
    }

    // Prepare payment data
    const paymentData: any = {
      tenantId,
      propertyId: tenant.propertyId,
      organizationId: user.organizationId,
      amount: amountNum,
      status: status || 'Paid',
      paymentDate: paymentDateObj,
      createdBy: user._id,
      recordedBy: user._id,
      paymentMethod: paymentMethod || 'Cash',
      description: description || `Payment from ${tenant.name}`,
      notes: notes || undefined,
      rentMonth: rentMonth || undefined
    };

    // Add optional fields with validation
    if (req.body.referenceNumber) {
      paymentData.referenceNumber = req.body.referenceNumber.trim().substring(0, 100);
    }
    if (req.body.transactionId) {
      paymentData.transactionId = req.body.transactionId.trim().substring(0, 100);
    }
    if (req.body.receivedBy) {
      paymentData.receivedBy = req.body.receivedBy.trim().substring(0, 100);
    }
    if (req.body.agentName) {
      paymentData.agentName = req.body.agentName.trim().substring(0, 100);
    }

    // Handle discount if provided
    if (req.body.discount) {
      const discount = req.body.discount;
      if (discount.type && discount.value && discount.amount) {
        paymentData.discount = {
          type: discount.type,
          value: parseFloat(discount.value),
          amount: parseFloat(discount.amount),
          reason: discount.reason || undefined
        };
        paymentData.originalAmount = amountNum + parseFloat(discount.amount);
      }
    }

    // Handle fees if provided
    if (req.body.fees) {
      const fees = req.body.fees;
      paymentData.fees = {
        processingFee: parseFloat(fees.processingFee) || 0,
        lateFee: parseFloat(fees.lateFee) || 0,
        otherFees: parseFloat(fees.otherFees) || 0
      };
    }

    console.log('Creating payment:', {
      tenantId,
      amount: amountNum,
      status: paymentData.status,
      paymentMethod: paymentData.paymentMethod
    });

    const newPayment = await Payment.create(paymentData);

    // Update subscription usage
    try {
      const subscriptionService = (await import('../services/subscriptionService')).default;
      await subscriptionService.updateUsage(user.organizationId, 'tenants', 1);
    } catch (usageError) {
      console.error('Usage update error:', usageError);
    }

    // Trigger action chain
    try {
      await actionChainService.onPaymentRecorded(newPayment, user._id, user.organizationId);
    } catch (actionError) {
      console.error('Action chain error (non-critical):', actionError);
    }

    // Populate response data
    const populatedPayment = await Payment.findById(newPayment._id)
      .populate('tenantId', 'name email unit')
      .populate('propertyId', 'name address')
      .populate('createdBy', 'name email')
      .lean();

    res.status(201).json({ 
      success: true, 
      data: populatedPayment,
      message: 'Payment created successfully'
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      let message = 'Duplicate entry detected';
      
      if (field === 'receiptNumber') {
        message = 'A payment with this receipt number already exists';
      }
      
      res.status(400).json({ 
        success: false, 
        message
      });
      return;
    }
    
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
      message: 'Failed to create payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    // Validate payment ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if user has access to this payment (unless Super Admin)
    if (req.user.role !== 'Super Admin' && 
        payment.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this payment' });
    }

    res.json({ success: true, data: payment });
  } catch (error: any) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    // Validate payment ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if user has access to this payment (unless Super Admin)
    if (req.user.role !== 'Super Admin' && 
        payment.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this payment' });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Payment deleted' });
  } catch (error: any) {
    console.error('Delete payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPaymentReceipt = async (req: AuthRequest, res: Response) => {
  try {
    console.log(`Receipt request for payment ID: ${req.params.id} by user: ${req.user?._id}`);
    
    // Validate payment ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Invalid payment ID format: ${req.params.id}`);
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('tenantId', 'name email phone unit rentAmount imageUrl tenantImage image profileImage')
      .populate('propertyId', 'name address type numberOfUnits imageUrl image images')
      .populate('organizationId', 'name')
      .lean();

    if (!payment) {
      console.log(`Payment not found: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if user has access to this payment (unless Super Admin)
    if (req.user.role !== 'Super Admin' && 
        payment.organizationId.toString() !== req.user.organizationId?.toString()) {
      console.log(`Access denied: User org ${req.user.organizationId} doesn't match payment org ${payment.organizationId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to access this payment receipt' });
    }

    console.log(`Generating receipt for payment: ${req.params.id}`);

    // Check if PDF is requested
    if (req.query.format === 'pdf') {
      try {
        const { generatePaymentReceiptPdf } = await import('../utils/paymentPdfGenerator');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Payment_Receipt_${payment._id}.pdf"`);
        
        generatePaymentReceiptPdf(payment, res, req.user?.language || 'en');
        return;
      } catch (pdfError) {
        console.error('PDF generation failed, falling back to HTML:', pdfError);
      }
    }

    // Default HTML receipt
    const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: linear-gradient(135deg, #f0f8ff, #e6f3ff); }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 8px; }
        .receipt-info { margin-bottom: 20px; }
        .amount { font-size: 28px; font-weight: bold; color: #16a34a; text-align: center; background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
        .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status.paid { background: #dcfce7; color: #166534; }
        .pdf-link { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>Receipt #: ${payment._id}</p>
        </div>
        
        <div class="amount">Amount Paid: $${payment.amount.toFixed(2)}</div>
        
        <div class="receipt-info">
          <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status paid">${payment.status}</span></p>
          <p><strong>Method:</strong> ${payment.paymentMethod || 'Cash'}</p>
          ${(payment as any).transactionId ? `<p><strong>Transaction ID:</strong> ${(payment as any).transactionId}</p>` : ''}
        </div>
        
        <table>
          <tr><th>Tenant</th><td>${(payment.tenantId as any)?.name || 'N/A'}</td></tr>
          <tr><th>Property</th><td>${(payment.propertyId as any)?.name || 'N/A'}</td></tr>
          <tr><th>Unit</th><td>${(payment.tenantId as any)?.unit || 'N/A'}</td></tr>
          <tr><th>Description</th><td>${payment.description || 'Rent Payment'}</td></tr>
          ${payment.rentMonth ? `<tr><th>Rent Month</th><td>${payment.rentMonth}</td></tr>` : ''}
        </table>
        
        <div style="text-align: center;">
          <a href="?format=pdf" class="pdf-link">Download PDF Receipt</a>
        </div>
        
        <div class="footer">
          <p>This is an official payment receipt. Please keep for your records.</p>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>HNV Property Management Solutions</p>
        </div>
      </div>
    </body>
    </html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(receiptHtml);
  } catch (error: any) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const sendPaymentReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate payment ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('tenantId', 'name email phone unit rentAmount imageUrl tenantImage image profileImage')
      .populate('propertyId', 'name address type numberOfUnits imageUrl image images');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if user has access to this payment (unless Super Admin)
    if (req.user.role !== 'Super Admin' && 
        payment.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this payment' });
    }

    // For now, just return success (email service would be implemented separately)
    console.log(`Would send receipt for payment ${req.params.id} to ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Receipt sent successfully',
      data: { email, paymentId: req.params.id }
    });
  } catch (error: any) {
    console.error('Send receipt error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || (!user.organizationId && user.role !== 'Super Admin')) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    // Validate payment ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment ID format'
      });
      return;
    }

    const payment = await Payment.findById(req.params.id)
      .populate('tenantId', 'name email phone unit rentAmount imageUrl tenantImage')
      .populate('propertyId', 'name address type numberOfUnits imageUrl')
      .populate('recordedBy', 'name email')
      .populate('createdBy', 'name email')
      .lean()
      .exec();

    if (!payment) {
      res.status(404).json({ 
        success: false, 
        message: 'Payment not found'
      });
      return;
    }

    // Check if user has access to this payment
    if (user.role !== 'Super Admin' && 
        payment.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ 
        success: false, 
        message: 'Not authorized'
      });
      return;
    }

    // Check agent permissions
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const property = await Property.findById(payment.propertyId);
      
      if (!property || property.managedByAgentId?.toString() !== user._id.toString()) {
        res.status(403).json({ success: false, message: 'Agents can only view payments from properties they manage' });
        return;
      }
    }

    res.status(200).json({ 
      success: true, 
      data: payment
    });
  } catch (error: any) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};