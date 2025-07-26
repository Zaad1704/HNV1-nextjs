import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import { catchAsync } from '../middleware/errorHandler';

export const getAdvancedAnalytics = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const orgId = req.user!.organization;
  const { period = 'month' } = req.query;

  // Revenue analytics
  const revenueData = await Payment.aggregate([
    { $match: { organization: orgId, status: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$paidDate' },
          month: { $month: '$paidDate' }
        },
        totalRevenue: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Occupancy trends
  const occupancyTrends = await Property.aggregate([
    { $match: { organization: orgId, isActive: true } },
    {
      $addFields: {
        totalUnits: { $size: '$units' },
        occupiedUnits: {
          $size: {
            $filter: {
              input: '$units',
              cond: { $eq: ['$$this.status', 'occupied'] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: '$type',
        avgOccupancy: {
          $avg: {
            $cond: {
              if: { $gt: ['$totalUnits', 0] },
              then: { $multiply: [{ $divide: ['$occupiedUnits', '$totalUnits'] }, 100] },
              else: 0
            }
          }
        },
        properties: { $sum: 1 }
      }
    }
  ]);

  // Payment method distribution
  const paymentMethods = await Payment.aggregate([
    { $match: { organization: orgId, status: 'completed' } },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  // Late payment analysis
  const latePayments = await Payment.aggregate([
    { $match: { organization: orgId } },
    {
      $addFields: {
        isLate: {
          $cond: {
            if: { $and: [{ $ne: ['$status', 'completed'] }, { $lt: ['$dueDate', new Date()] }] },
            then: 1,
            else: 0
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        latePayments: { $sum: '$isLate' },
        latePaymentRate: {
          $avg: '$isLate'
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      revenueData,
      occupancyTrends,
      paymentMethods,
      latePayments: latePayments[0] || { totalPayments: 0, latePayments: 0, latePaymentRate: 0 },
      period
    }
  });
});

export const getTenantAnalytics = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const orgId = req.user!.organization;

  // Tenant status distribution
  const tenantStatus = await Tenant.aggregate([
    { $match: { organization: orgId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Lease expiration analysis
  const leaseExpirations = await Tenant.aggregate([
    { $match: { organization: orgId, status: 'active' } },
    {
      $addFields: {
        daysUntilExpiry: {
          $divide: [
            { $subtract: ['$lease.endDate', new Date()] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $bucket: {
        groupBy: '$daysUntilExpiry',
        boundaries: [-Infinity, 0, 30, 60, 90, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          tenants: {
            $push: {
              name: { $concat: ['$firstName', ' ', '$lastName'] },
              leaseEnd: '$lease.endDate'
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      tenantStatus,
      leaseExpirations
    }
  });
});