import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

export const getExpenses = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || (!user.organizationId && user.role !== 'Super Admin')) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      propertyId, 
      search, 
      sortBy = 'date', 
      sortOrder = 'desc',
      startDate,
      endDate,
      includeArchived = 'false'
    } = req.query;

    let query: any = user.role === 'Super Admin' && !user.organizationId 
      ? {} 
      : { organizationId: user.organizationId };
    
    // Filter by status
    if (includeArchived !== 'true') {
      query.status = 'Active';
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by property
    if (propertyId) {
      query.propertyId = propertyId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'vendor.name': { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
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
    const [expenses, totalCount] = await Promise.all([
      Expense.find(query)
        .populate('propertyId', 'name address')
        .populate('createdBy', 'name email')
        .populate('paidToAgentId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Expense.countDocuments(query)
    ]);

    // Calculate summary statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const categoryStats = expenses.reduce((acc: any, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    res.status(200).json({ 
      success: true, 
      data: expenses,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      },
      summary: {
        totalExpenses: totalCount,
        totalAmount,
        averageAmount: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
        categoryBreakdown: categoryStats
      }
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { description, amount, category, date, propertyId } = req.body;

    // Validate required fields
    const requiredFields = { description, amount, category };
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

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Amount must be a valid positive number' 
      });
      return;
    }

    // Validate date
    let expenseDate = new Date();
    if (date) {
      expenseDate = new Date(date);
      if (isNaN(expenseDate.getTime())) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid date format' 
        });
        return;
      }
      
      if (expenseDate > new Date()) {
        res.status(400).json({ 
          success: false, 
          message: 'Expense date cannot be in the future' 
        });
        return;
      }
    }

    // Validate property if provided
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
        res.status(403).json({ 
          success: false, 
          message: 'Invalid property or property not found' 
        });
        return;
      }
    }

    // Prepare expense data
    const expenseData: any = {
      description: description.trim(),
      amount: amountNum,
      category,
      date: expenseDate,
      propertyId: propertyId || undefined,
      organizationId: user.organizationId,
      createdBy: user._id,
      status: 'Active'
    };

    // Add optional fields with validation
    if (req.body.vendor) {
      const vendor = req.body.vendor;
      expenseData.vendor = {};
      if (vendor.name) expenseData.vendor.name = vendor.name.trim().substring(0, 100);
      if (vendor.phone) expenseData.vendor.phone = vendor.phone.trim();
      if (vendor.email) expenseData.vendor.email = vendor.email.toLowerCase().trim();
    }
    
    if (req.body.paymentMethod) {
      expenseData.paymentMethod = req.body.paymentMethod.trim().substring(0, 50);
    }
    
    if (req.body.notes) {
      expenseData.notes = req.body.notes.trim().substring(0, 1000);
    }
    
    if (req.body.documentUrl) {
      expenseData.documentUrl = req.body.documentUrl;
    }
    
    if (req.body.receiptNumber) {
      expenseData.receiptNumber = req.body.receiptNumber.trim().substring(0, 50);
    }

    console.log('Creating expense:', {
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      propertyId: expenseData.propertyId
    });

    const newExpense = await Expense.create(expenseData);

    // Populate response data
    const populatedExpense = await Expense.findById(newExpense._id)
      .populate('propertyId', 'name address')
      .populate('createdBy', 'name email')
      .lean();

    res.status(201).json({ 
      success: true, 
      data: populatedExpense,
      message: 'Expense created successfully'
    });
  } catch (error: any) {
    console.error('Create expense error:', error);
    
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
      message: 'Failed to create expense',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId && req.user?.role !== 'Super Admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const expense = await Expense.findById(req.params.id)
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Check authorization
    if (req.user.role !== 'Super Admin' && expense.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this expense' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};