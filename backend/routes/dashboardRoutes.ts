import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getOverviewStats,
  getLateTenants,
  getExpiringLeases,
  getFinancialSummary,
  getRentStatus,
  getStats,
  getDashboardStats
} from '../controllers/dashboardController';

const router = Router();

router.use(protect);

router.get('/overview', getOverviewStats);
router.get('/overview-stats', getOverviewStats);
router.get('/late-tenants', getLateTenants);
router.get('/expiring-leases', getExpiringLeases);
router.get('/financial-summary', getFinancialSummary);
router.get('/rent-status', getRentStatus);
router.get('/stats', getStats);
router.get('/dashboard-stats', getDashboardStats);
router.get('/cashflow', async (req, res) => {
  res.json({
    success: true,
    data: {
      income: 0,
      expenses: 0,
      netFlow: 0,
      monthlyData: []
    }
  });
});

// Cash flow details for specific month/year
router.get('/cashflow/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Mock data for now - in a real implementation, this would query the database
    const mockData = {
      income: 15000,
      expenses: 8500,
      netFlow: 6500,
      propertyCount: 5,
      tenantCount: 12,
      paymentCount: 15,
      expenseCount: 8,
      incomeBreakdown: [
        { source: 'Rent Payments', description: 'Monthly rent collection', amount: 12000 },
        { source: 'Late Fees', description: 'Late payment penalties', amount: 500 },
        { source: 'Security Deposits', description: 'New tenant deposits', amount: 2500 }
      ],
      expenseBreakdown: [
        { category: 'Maintenance', description: 'Property repairs and upkeep', amount: 3500 },
        { category: 'Utilities', description: 'Water, electricity, gas', amount: 2000 },
        { category: 'Insurance', description: 'Property insurance premiums', amount: 1500 },
        { category: 'Management', description: 'Property management fees', amount: 1500 }
      ],
      propertyBreakdown: [
        { name: 'Sunset Apartments', income: 5000, expenses: 2000, netFlow: 3000 },
        { name: 'Downtown Lofts', income: 4500, expenses: 2500, netFlow: 2000 },
        { name: 'Garden View Complex', income: 3500, expenses: 2000, netFlow: 1500 },
        { name: 'Riverside Condos', income: 2000, expenses: 2000, netFlow: 0 }
      ]
    };
    
    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Cash flow details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cash flow details'
    });
  }
});

router.get('/recent-activity', async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        type: 'payment',
        title: 'Payment Received',
        description: 'Monthly rent payment from John Doe',
        timestamp: new Date().toISOString(),
        amount: 1200
      }
    ]
  });
});

export default router;
