import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

const mockExpenses = [
  {
    _id: '1',
    description: 'Plumbing repair - Unit 101',
    amount: 350,
    category: 'maintenance',
    property: { name: 'Sunset Apartments' },
    date: new Date(),
    vendor: 'ABC Plumbing'
  },
  {
    _id: '2',
    description: 'Property insurance',
    amount: 1200,
    category: 'insurance',
    property: { name: 'Downtown Lofts' },
    date: new Date(),
    vendor: 'XYZ Insurance'
  }
];

export const getExpenses = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      expenses: mockExpenses,
      pagination: { page: 1, limit: 10, total: mockExpenses.length, pages: 1 }
    }
  });
});

export const createExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const newExpense = {
    _id: Date.now().toString(),
    ...req.body,
    date: new Date()
  };
  mockExpenses.push(newExpense);
  
  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense: newExpense }
  });
});

export const updateExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockExpenses.findIndex(e => e._id === req.params.id);
  if (index !== -1) {
    mockExpenses[index] = { ...mockExpenses[index], ...req.body };
  }
  
  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense: mockExpenses[index] }
  });
});

export const deleteExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockExpenses.findIndex(e => e._id === req.params.id);
  if (index !== -1) {
    mockExpenses.splice(index, 1);
  }
  
  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully'
  });
});