import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

export const getDashboardStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const mockData = {
    overview: {
      totalProperties: 5,
      activeTenants: 12,
      totalUnits: 15,
      occupancyRate: 80,
      monthlyRevenue: 14400
    },
    recentTenants: [
      { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: 'active' },
      { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', status: 'active' }
    ],
    alerts: [
      { type: 'info', message: 'System running normally' }
    ]
  };

  res.status(200).json({
    success: true,
    data: mockData
  });
});

export const getFinancialSummary = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      totalRevenue: 14400,
      totalExpenses: 3200,
      netIncome: 11200,
      period: req.query.period || 'month'
    }
  });
});

export const getOccupancyTrends = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      currentOccupancy: 80,
      trend: 'stable',
      history: [75, 78, 80, 82, 80]
    }
  });
});