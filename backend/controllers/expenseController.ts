import { Request, Response } from 'express';
import Expense from '../models/Expense';
import { catchAsync, CustomError } from '../middleware/errorHandler';

export const getExpenses = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, category, property } = req.query;
  
  const query: any = { organization: req.user!.organization };
  
  if (category) query.category = category;
  if (property) query.property = property;

  const expenses = await Expense.find(query)
    .populate('property', 'name address')
    .populate('createdBy', 'firstName lastName')
    .sort({ date: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Expense.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const createExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const expenseData = {
    ...req.body,
    organization: req.user!.organization,
    createdBy: req.user!._id
  };

  const expense = await Expense.create(expenseData);

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense }
  });
});

export const updateExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, organization: req.user!.organization },
    req.body,
    { new: true, runValidators: true }
  );

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense }
  });
});

export const deleteExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!expense) {
    throw new CustomError('Expense not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully'
  });
});