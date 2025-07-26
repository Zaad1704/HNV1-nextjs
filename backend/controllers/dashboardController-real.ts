import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

// In-memory data store
const mockData = {
  properties: [
    { _id: '1', name: 'Sunset Apartments', units: 8, occupied: 6, rent: 1200 },
    { _id: '2', name: 'Downtown Lofts', units: 4, occupied: 4, rent: 1800 },
    { _id: '3', name: 'Garden View', units: 6, occupied: 5, rent: 1000 }
  ],
  tenants: [
    { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', status: 'active', rent: 1200 },
    { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', status: 'active', rent: 1800 },
    { _id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', status: 'active', rent: 1000 }
  ],
  payments: [
    { _id: '1', tenant: '1', amount: 1200, status: 'completed', dueDate: new Date(), type: 'rent' },
    { _id: '2', tenant: '2', amount: 1800, status: 'pending', dueDate: new Date(), type: 'rent' }
  ],
  expenses: [
    { _id: '1', description: 'Plumbing repair', amount: 300, category: 'maintenance', date: new Date() },
    { _id: '2', description: 'Insurance', amount: 500, category: 'insurance', date: new Date() }
  ],
  maintenance: [
    { _id: '1', title: 'Leaky faucet', status: 'open', priority: 'medium', tenant: { firstName: 'John', lastName: 'Doe' } },
    { _id: '2', title: 'AC not working', status: 'in_progress', priority: 'high', tenant: { firstName: 'Jane', lastName: 'Smith' } }
  ]
};

export const getDashboardStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const totalProperties = mockData.properties.length;
  const activeTenants = mockData.tenants.filter(t => t.status === 'active').length;
  const totalUnits = mockData.properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = mockData.properties.reduce((sum, p) => sum + p.occupied, 0);
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const monthlyRevenue = mockData.tenants.reduce((sum, t) => sum + t.rent, 0);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalProperties,
        activeTenants,
        totalUnits,
        occupancyRate,
        monthlyRevenue
      },
      recentTenants: mockData.tenants.slice(0, 5),
      alerts: occupancyRate < 80 ? [{ type: 'warning', message: 'Low occupancy rate' }] : []
    }
  });
});

export const getFinancialSummary = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const totalRevenue = mockData.payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = mockData.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      period: req.query.period || 'month'
    }
  });
});

export const getOccupancyTrends = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const totalUnits = mockData.properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = mockData.properties.reduce((sum, p) => sum + p.occupied, 0);
  const currentOccupancy = Math.round((occupiedUnits / totalUnits) * 100);

  res.status(200).json({
    success: true,
    data: {
      currentOccupancy,
      trend: 'stable',
      history: [75, 78, 80, 82, currentOccupancy]
    }
  });
});