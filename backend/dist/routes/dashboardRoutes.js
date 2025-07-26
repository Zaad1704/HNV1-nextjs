"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const dashboardController_1 = require("../controllers/dashboardController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/overview', dashboardController_1.getOverviewStats);
router.get('/overview-stats', dashboardController_1.getOverviewStats);
router.get('/late-tenants', dashboardController_1.getLateTenants);
router.get('/expiring-leases', dashboardController_1.getExpiringLeases);
router.get('/financial-summary', dashboardController_1.getFinancialSummary);
router.get('/rent-status', dashboardController_1.getRentStatus);
router.get('/stats', dashboardController_1.getStats);
router.get('/dashboard-stats', dashboardController_1.getDashboardStats);
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
router.get('/cashflow/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
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
    }
    catch (error) {
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
exports.default = router;
