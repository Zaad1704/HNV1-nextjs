import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';

const router = Router();

router.use(protect);

// Get rent status overview for a property by year
router.get('/:propertyId/rent-status/:year', async (req: any, res) => {
  try {
    const { propertyId, year } = req.params;
    
    // Get all payments for the property in the specified year
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    const payments = await Payment.find({
      propertyId,
      organizationId: req.user.organizationId,
      paymentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['Paid', 'completed'] }
    }).populate('tenantId', 'name unit');

    // Get all active tenants for the property
    const tenants = await Tenant.find({
      propertyId,
      organizationId: req.user.organizationId,
      status: 'Active'
    });

    // Calculate monthly breakdown
    const months = Array.from({ length: 12 }, (_, i) => ({
      paid: 0,
      due: 0,
      paidTenants: [],
      dueTenants: []
    }));

    let totalPaid = 0;
    let totalDue = 0;
    const paidTenants = new Set();
    const dueTenants = new Set();

    // Process each tenant for each month they should have paid
    tenants.forEach(tenant => {
      // Get tenant start month (when they were created)
      const tenantStartDate = new Date(tenant.createdAt || `${year}-01-01`);
      const startMonth = tenantStartDate.getFullYear() === parseInt(year) ? tenantStartDate.getMonth() : 0;
      const endMonth = 11; // December
      
      for (let month = startMonth; month <= endMonth; month++) {
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const payment = payments.find(p => 
          p.tenantId._id.toString() === tenant._id.toString() &&
          p.rentMonth === monthKey
        );
        
        if (payment) {
          months[month].paid += payment.amount;
          months[month].paidTenants.push({
            _id: tenant._id,
            name: tenant.name,
            unit: tenant.unit,
            amount: payment.amount
          });
          totalPaid += payment.amount;
          paidTenants.add(tenant._id.toString());
        } else {
          months[month].due += tenant.rentAmount || 0;
          months[month].dueTenants.push({
            _id: tenant._id,
            name: tenant.name,
            unit: tenant.unit,
            amount: tenant.rentAmount || 0
          });
          totalDue += tenant.rentAmount || 0;
          dueTenants.add(tenant._id.toString());
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalPaid,
        totalDue,
        paidCount: paidTenants.size,
        dueCount: dueTenants.size,
        months,
        paidTenantsList: Array.from(paidTenants).map(id => tenants.find(t => t._id.toString() === id)),
        dueTenantsList: Array.from(dueTenants).map(id => tenants.find(t => t._id.toString() === id))
      }
    });
  } catch (error) {
    console.error('Rent status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get detailed rent information for a specific month
router.get('/:propertyId/rent-details/:month', async (req: any, res) => {
  try {
    const { propertyId, month } = req.params; // month format: YYYY-MM
    
    // Get payments for the specific month
    const payments = await Payment.find({
      propertyId,
      organizationId: req.user.organizationId,
      rentMonth: month,
      status: { $in: ['Paid', 'completed'] }
    }).populate('tenantId', 'name unit rentAmount');

    // Get all active tenants
    const allTenants = await Tenant.find({
      propertyId,
      organizationId: req.user.organizationId,
      status: 'Active'
    });

    // Find tenants who haven't paid
    const paidTenantIds = payments.map(p => p.tenantId._id.toString());
    const dueTenants = allTenants.filter(tenant => 
      !paidTenantIds.includes(tenant._id.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        paid: payments,
        due: dueTenants,
        totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
        totalDue: dueTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
      }
    });
  } catch (error) {
    console.error('Rent details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;