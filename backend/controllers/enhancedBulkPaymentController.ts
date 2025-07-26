import { Request, Response } from 'express';
import BulkPaymentBatch from '../models/BulkPaymentBatch';
import PaymentSchedule from '../models/PaymentSchedule';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import Unit from '../models/Unit';
import { IUser } from '../models/User';

// Create bulk payment batch
export const createBulkPaymentBatch = async (req: Request, res: Response) => {
  try {
    const { batchName, batchType, filters, paymentDetails } = req.body;
    const organizationId = (req.user as IUser)?.organizationId;

    // Get tenants based on filters
    const tenants = await getTenantsByFilters(organizationId, filters);
    
    const payments = await Promise.all(tenants.map(async (tenant) => {
      const unit = await Unit.findOne({ tenantId: tenant._id });
      return {
        tenantId: tenant._id,
        propertyId: tenant.propertyId,
        unitId: unit?._id,
        amount: paymentDetails.amount || tenant.rentAmount,
        status: 'pending' as const
      };
    }));

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    const batch = new BulkPaymentBatch({
      organizationId,
      batchName,
      batchType,
      filters,
      paymentDetails,
      payments,
      totalAmount,
      totalPayments: payments.length,
      summary: {
        totalTenants: payments.length,
        totalProperties: [...new Set(payments.map(p => p.propertyId.toString()))].length,
        avgPaymentAmount: payments.length > 0 ? totalAmount / payments.length : 0,
        successRate: 0
      },
      createdBy: (req.user as IUser)?._id
    });

    await batch.save();
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create bulk payment batch' });
  }
};

// Process bulk payment batch
export const processBulkPaymentBatch = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const organizationId = (req.user as IUser)?.organizationId;

    const batch = await BulkPaymentBatch.findOne({ _id: batchId, organizationId });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    batch.status = 'processing';
    batch.processingStarted = new Date();
    await batch.save();

    // Process payments in background
    processPaymentBatch(batch);

    res.json({ success: true, message: 'Batch processing started', data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process bulk payment batch' });
  }
};

// Get bulk payment batches
export const getBulkPaymentBatches = async (req: Request, res: Response) => {
  try {
    const organizationId = (req.user as IUser)?.organizationId;
    const { status, limit = 20 } = req.query;

    const filter: any = { organizationId };
    if (status) filter.status = status;

    const batches = await BulkPaymentBatch.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('createdBy', 'name email');

    res.json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bulk payment batches' });
  }
};

// Create payment schedule
export const createPaymentSchedule = async (req: Request, res: Response) => {
  try {
    const {
      tenantId,
      propertyId,
      unitId,
      scheduleType,
      frequency,
      amount,
      startDate,
      endDate,
      autoProcess,
      paymentMethod,
      reminders,
      installmentPlan
    } = req.body;

    const organizationId = (req.user as IUser)?.organizationId;

    const nextDueDate = calculateNextDueDate(new Date(startDate), frequency);

    const schedule = new PaymentSchedule({
      organizationId,
      tenantId,
      propertyId,
      unitId,
      scheduleType,
      frequency,
      amount,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      nextDueDate,
      autoProcess,
      paymentMethod,
      reminders: reminders || {
        enabled: true,
        daysBefore: [7, 3, 1],
        methods: ['email']
      },
      installmentPlan,
      createdBy: (req.user as IUser)?._id
    });

    await schedule.save();
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create payment schedule' });
  }
};

// Get payment schedules
export const getPaymentSchedules = async (req: Request, res: Response) => {
  try {
    const organizationId = (req.user as IUser)?.organizationId;
    const { tenantId, status, limit = 50 } = req.query;

    const filter: any = { organizationId };
    if (tenantId) filter.tenantId = tenantId;
    if (status) filter.status = status;

    const schedules = await PaymentSchedule.find(filter)
      .populate('tenantId', 'name email')
      .populate('propertyId', 'name')
      .populate('unitId', 'unitNumber nickname')
      .sort({ nextDueDate: 1 })
      .limit(Number(limit));

    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment schedules' });
  }
};

// Process scheduled payments
export const processScheduledPayments = async (req: Request, res: Response) => {
  try {
    const organizationId = (req.user as IUser)?.organizationId;
    const today = new Date();

    const dueSchedules = await PaymentSchedule.find({
      organizationId,
      status: 'active',
      nextDueDate: { $lte: today },
      autoProcess: true
    });

    const processedPayments = [];

    for (const schedule of dueSchedules) {
      try {
        const payment = new Payment({
          tenantId: schedule.tenantId,
          propertyId: schedule.propertyId,
          organizationId,
          amount: schedule.amount,
          status: 'completed',
          paymentDate: new Date(),
          description: `Automated payment - ${schedule.frequency}`,
          paymentMethod: schedule.paymentMethod,
          createdBy: (req.user as IUser)?._id
        });

        await payment.save();

        // Update schedule
        schedule.processedPayments.push({
          paymentId: payment._id,
          processedDate: new Date(),
          amount: schedule.amount,
          status: 'success'
        });

        schedule.nextDueDate = calculateNextDueDate(schedule.nextDueDate, schedule.frequency);
        
        // Check if installment plan is complete
        if (schedule.installmentPlan) {
          schedule.installmentPlan.currentInstallment += 1;
          if (schedule.installmentPlan.currentInstallment > schedule.installmentPlan.installments) {
            schedule.status = 'completed';
          }
        }

        await schedule.save();
        processedPayments.push(payment);
      } catch (error) {
        console.error(`Failed to process payment for schedule ${schedule._id}:`, error);
      }
    }

    res.json({
      success: true,
      data: processedPayments,
      message: `${processedPayments.length} scheduled payments processed`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process scheduled payments' });
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (req: Request, res: Response) => {
  try {
    const organizationId = (req.user as IUser)?.organizationId;
    const { period = 'monthly' } = req.query;

    const [
      totalPayments,
      scheduledPayments,
      bulkBatches,
      recentActivity
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]),
      PaymentSchedule.countDocuments({ organizationId, status: 'active' }),
      BulkPaymentBatch.find({ organizationId }).sort({ createdAt: -1 }).limit(5),
      Payment.find({ organizationId }).sort({ createdAt: -1 }).limit(10)
        .populate('tenantId', 'name')
        .populate('propertyId', 'name')
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalPayments[0]?.total || 0,
          totalPayments: totalPayments[0]?.count || 0,
          avgPaymentAmount: totalPayments[0]?.avgAmount || 0,
          activeSchedules: scheduledPayments
        },
        recentBatches: bulkBatches,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment analytics' });
  }
};

// Helper functions
async function getTenantsByFilters(organizationId: any, filters: any) {
  const query: any = { organizationId, status: 'Active' };
  
  if (filters.propertyIds?.length) {
    query.propertyId = { $in: filters.propertyIds };
  }
  
  if (filters.tenantIds?.length) {
    query._id = { $in: filters.tenantIds };
  }

  return await Tenant.find(query);
}

async function processPaymentBatch(batch: any) {
  try {
    let successCount = 0;
    let failCount = 0;

    for (const paymentData of batch.payments) {
      try {
        const payment = new Payment({
          tenantId: paymentData.tenantId,
          propertyId: paymentData.propertyId,
          organizationId: batch.organizationId,
          amount: paymentData.amount,
          status: batch.paymentDetails.autoProcess ? 'completed' : 'pending',
          paymentDate: batch.paymentDetails.dueDate,
          description: batch.paymentDetails.description,
          paymentMethod: batch.paymentDetails.paymentMethod,
          createdBy: batch.createdBy
        });

        await payment.save();

        paymentData.status = 'success';
        paymentData.paymentId = payment._id;
        paymentData.processedAt = new Date();
        successCount++;
      } catch (error) {
        paymentData.status = 'failed';
        paymentData.errorMessage = (error as Error).message;
        paymentData.processedAt = new Date();
        failCount++;
      }
    }

    batch.status = failCount === 0 ? 'completed' : successCount > 0 ? 'partial' : 'failed';
    batch.processedPayments = batch.payments.length;
    batch.successfulPayments = successCount;
    batch.failedPayments = failCount;
    batch.processingCompleted = new Date();
    batch.summary.successRate = (successCount / batch.payments.length) * 100;

    await batch.save();
  } catch (error) {
    batch.status = 'failed';
    batch.processingCompleted = new Date();
    await batch.save();
  }
}

function calculateNextDueDate(currentDate: Date, frequency: string): Date {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
}