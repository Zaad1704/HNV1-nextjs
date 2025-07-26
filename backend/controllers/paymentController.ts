import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import { catchAsync, CustomError } from '../middleware/errorHandler';

export const getPayments = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, tenant, property } = req.query;
  
  const query: any = { organization: req.user!.organization };
  
  if (status) query.status = status;
  if (tenant) query.tenant = tenant;
  if (property) query.property = property;

  const payments = await Payment.find(query)
    .populate('tenant', 'firstName lastName email')
    .populate('property', 'name address')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const createPayment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const paymentData = {
    ...req.body,
    organization: req.user!.organization,
    createdBy: req.user!._id,
    receiptNumber: `RCP-${Date.now()}`
  };

  if (paymentData.status === 'completed' && !paymentData.paidDate) {
    paymentData.paidDate = new Date();
  }

  const payment = await Payment.create(paymentData);

  // Update tenant payment history
  if (payment.status === 'completed') {
    await Tenant.findByIdAndUpdate(payment.tenant, {
      $inc: { 'paymentHistory.totalPaid': payment.amount },
      'paymentHistory.lastPaymentDate': payment.paidDate,
      'paymentHistory.lastPaymentAmount': payment.amount
    });
  }

  res.status(201).json({
    success: true,
    message: 'Payment created successfully',
    data: { payment }
  });
});

export const updatePayment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, organization: req.user!.organization },
    req.body,
    { new: true, runValidators: true }
  );

  if (!payment) {
    throw new CustomError('Payment not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Payment updated successfully',
    data: { payment }
  });
});