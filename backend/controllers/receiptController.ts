import { Request, Response } from 'express';
import Receipt from '../models/Receipt';
import Payment from '../models/Payment';
import { generateColorfulPdfReceipt, generateEnhancedThermalReceipt } from '../utils/receiptGenerator';

interface AuthRequest extends Request {
  user?: any;
}

// Get receipts with pagination and filtering
export const getReceipts = async (req: AuthRequest, res: Response) => {
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
      category,
      propertyId, 
      tenantId,
      search, 
      sortBy = 'paymentDate', 
      sortOrder = 'desc',
      startDate,
      endDate,
      rentMonth
    } = req.query;

    let query: any = { organizationId: user.organizationId };
    
    // Apply filters
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (propertyId) query.propertyId = propertyId;
    if (tenantId) query.tenantId = tenantId;
    if (rentMonth) query.rentMonth = rentMonth;
    
    // Date range filter
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate as string);
      if (endDate) query.paymentDate.$lte = new Date(endDate as string);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: 'i' } },
        { tenantName: { $regex: search, $options: 'i' } },
        { propertyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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
    const [receipts, totalCount] = await Promise.all([
      Receipt.find(query)
        .populate('tenantId', 'name email unit')
        .populate('propertyId', 'name address')
        .populate('paymentId', 'amount status paymentMethod')
        .populate('issuedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Receipt.countDocuments(query)
    ]);

    // Calculate summary statistics
    const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    const categoryStats = receipts.reduce((acc: any, receipt) => {
      acc[receipt.category] = (acc[receipt.category] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({ 
      success: true, 
      data: receipts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      },
      summary: {
        totalReceipts: totalCount,
        totalAmount,
        categoryStats
      }
    });
  } catch (error: any) {
    console.error('Get receipts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch receipts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create receipt
export const createReceipt = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { paymentId, title, category, description, notes } = req.body;

    if (!paymentId) {
      res.status(400).json({ success: false, message: 'Payment ID is required' });
      return;
    }

    // Verify payment exists and belongs to organization
    const payment = await Payment.findById(paymentId)
      .populate('tenantId', 'name unit')
      .populate('propertyId', 'name');

    if (!payment || payment.organizationId.toString() !== user.organizationId.toString()) {
      res.status(400).json({ success: false, message: 'Invalid payment' });
      return;
    }

    // Check if receipt already exists for this payment
    const existingReceipt = await Receipt.findOne({ paymentId });
    if (existingReceipt) {
      res.status(400).json({ success: false, message: 'Receipt already exists for this payment' });
      return;
    }

    const receiptData = {
      tenantId: payment.tenantId._id,
      propertyId: payment.propertyId._id,
      organizationId: user.organizationId,
      paymentId,
      title: title || `Receipt for ${(payment.tenantId as any).name}`,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      category: category || 'Rent',
      tenantName: (payment.tenantId as any).name,
      propertyName: (payment.propertyId as any).name,
      unitNumber: (payment.tenantId as any).unit || 'N/A',
      description: description || `Payment receipt for ${(payment.tenantId as any).name}`,
      notes: notes || undefined,
      transactionId: payment.transactionId || undefined,
      issuedBy: user._id,
      status: 'Generated'
    };

    const receipt = await Receipt.create(receiptData);

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate('tenantId', 'name email unit')
      .populate('propertyId', 'name address')
      .populate('paymentId', 'amount status')
      .populate('issuedBy', 'name email')
      .lean();

    res.status(201).json({ 
      success: true, 
      data: populatedReceipt,
      message: 'Receipt created successfully'
    });
  } catch (error: any) {
    console.error('Create receipt error:', error);
    
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
      message: 'Failed to create receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search receipts
export const searchReceipts = async (req: AuthRequest, res: Response) => {
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

    const receipts = await Receipt.find({
      organizationId: user.organizationId,
      $or: [
        { receiptNumber: { $regex: q, $options: 'i' } },
        { tenantName: { $regex: q, $options: 'i' } },
        { propertyName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('tenantId', 'name unit')
    .populate('propertyId', 'name address')
    .select('receiptNumber tenantName propertyName amount paymentDate status category')
    .sort({ paymentDate: -1 })
    .limit(Math.min(50, parseInt(limit as string)))
    .lean();

    res.status(200).json({ success: true, data: receipts });
  } catch (error: any) {
    console.error('Search receipts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search receipts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get receipt summary
export const getReceiptSummary = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const [receipts, currentMonth, lastMonth] = await Promise.all([
      Receipt.find({ organizationId: user.organizationId }).lean(),
      Receipt.find({
        organizationId: user.organizationId,
        paymentDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }).lean(),
      Receipt.find({
        organizationId: user.organizationId,
        paymentDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }).lean()
    ]);

    const totalReceipts = receipts.length;
    const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const currentMonthAmount = currentMonth.reduce((sum, r) => sum + (r.amount || 0), 0);
    const lastMonthAmount = lastMonth.reduce((sum, r) => sum + (r.amount || 0), 0);
    const monthlyGrowth = lastMonthAmount > 0 ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;

    // Status distribution
    const statusDistribution = receipts.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryDistribution = receipts.reduce((acc: any, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalReceipts,
          totalAmount,
          averageAmount: totalReceipts > 0 ? Math.round(totalAmount / totalReceipts) : 0,
          currentMonthReceipts: currentMonth.length,
          lastMonthReceipts: lastMonth.length
        },
        monthly: {
          currentMonth: currentMonthAmount,
          lastMonth: lastMonthAmount,
          growth: Math.round(monthlyGrowth * 100) / 100
        },
        distributions: {
          status: statusDistribution,
          category: categoryDistribution
        }
      }
    });
  } catch (error: any) {
    console.error('Get receipt summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch receipt summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk receipt actions
export const bulkReceiptActions = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { action, receiptIds } = req.body;

    if (!action || !receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid request data' });
      return;
    }

    // Verify all receipts belong to the organization
    const receipts = await Receipt.find({
      _id: { $in: receiptIds },
      organizationId: user.organizationId
    });

    if (receipts.length !== receiptIds.length) {
      res.status(403).json({ success: false, message: 'Some receipts not found or not authorized' });
      return;
    }

    let results = [];

    switch (action) {
      case 'mark_sent':
        await Receipt.updateMany(
          { _id: { $in: receiptIds } },
          { status: 'Sent', sentAt: new Date() }
        );
        results = receiptIds.map(id => ({ receiptId: id, status: 'sent' }));
        break;

      case 'mark_downloaded':
        await Receipt.updateMany(
          { _id: { $in: receiptIds } },
          { status: 'Downloaded', downloadedAt: new Date() }
        );
        results = receiptIds.map(id => ({ receiptId: id, status: 'downloaded' }));
        break;

      case 'mark_printed':
        await Receipt.updateMany(
          { _id: { $in: receiptIds } },
          { status: 'Printed', printedAt: new Date() }
        );
        results = receiptIds.map(id => ({ receiptId: id, status: 'printed' }));
        break;

      default:
        res.status(400).json({ success: false, message: 'Unknown action' });
        return;
    }

    res.status(200).json({
      success: true,
      data: {
        action,
        processedCount: results.length,
        results
      },
      message: `Bulk ${action} completed successfully`
    });
  } catch (error: any) {
    console.error('Bulk receipt action error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to perform bulk action',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const generatePaymentReceipt = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const paymentId = req.params.paymentId;
    const { format: printFormat = 'standard' } = req.query;
    const language = user?.language || 'en';

    const payment = await Payment.findById(paymentId)
      .populate('tenantId', 'name email phone unit')
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .populate('recordedBy', 'name')
      .lean();

    if (!payment || payment.organizationId.toString() !== user.organizationId.toString()) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    // Generate PDF receipt format
    if (printFormat === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment._id}.pdf"`);
      return generateColorfulPdfReceipt(payment, res, language);
    }
    
    // Generate thermal receipt format
    if (printFormat === 'thermal') {
      const thermalReceipt = generateEnhancedThermalReceipt(payment);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment._id}-thermal.txt"`);
      return res.send(thermalReceipt);
    }

    // Standard format (JSON data)
    res.status(200).json({ success: true, data: payment });
  } catch (error: any) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};