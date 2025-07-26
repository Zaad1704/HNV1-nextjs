import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

const mockPayments = [
  {
    _id: '1',
    tenant: { firstName: 'John', lastName: 'Doe' },
    amount: 1200,
    type: 'rent',
    status: 'completed',
    method: 'bank_transfer',
    dueDate: new Date(),
    paidDate: new Date(),
    receiptNumber: 'RCP-001'
  },
  {
    _id: '2',
    tenant: { firstName: 'Jane', lastName: 'Smith' },
    amount: 1800,
    type: 'rent',
    status: 'pending',
    method: 'check',
    dueDate: new Date(Date.now() + 7*24*60*60*1000),
    receiptNumber: 'RCP-002'
  }
];

export const getPayments = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      payments: mockPayments,
      pagination: { page: 1, limit: 10, total: mockPayments.length, pages: 1 }
    }
  });
});

export const createPayment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const newPayment = {
    _id: Date.now().toString(),
    ...req.body,
    receiptNumber: `RCP-${Date.now()}`
  };
  mockPayments.push(newPayment);
  
  res.status(201).json({
    success: true,
    message: 'Payment created successfully',
    data: { payment: newPayment }
  });
});

export const updatePayment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockPayments.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    mockPayments[index] = { ...mockPayments[index], ...req.body };
  }
  
  res.status(200).json({
    success: true,
    message: 'Payment updated successfully',
    data: { payment: mockPayments[index] }
  });
});