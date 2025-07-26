import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Reminder from '../models/Reminder';

class DashboardService {
  async getDashboardStats(organizationId: string, userRole?: string, userId?: string) {
    try {
      if (!organizationId) {
        console.log('No organizationId provided to getDashboardStats');
        return {
          totalProperties: 0,
          totalTenants: 0,
          monthlyRevenue: 0,
          occupancyRate: 0,
          pendingMaintenance: 0,
          recentPayments: 0
        };
      }
      
      // Role-based filtering
      let propertyFilter: any = { organizationId, status: { $ne: 'Archived' } };
      let tenantFilter: any = { organizationId, status: { $ne: 'Archived' } };
      let paymentFilter: any = { organizationId };
      
      if (userRole === 'Agent' && userId) {
        // Get user's managed properties from User model
        const User = (await import('../models/User')).default;
        const userData = await User.findById(userId).select('managedProperties');
        const managedPropertyIds = userData?.managedProperties || [];
        
        // Filter by managed properties
        propertyFilter._id = { $in: managedPropertyIds };
        tenantFilter.propertyId = { $in: managedPropertyIds };
        paymentFilter.propertyId = { $in: managedPropertyIds };
      }

      // Use Promise.allSettled for better error handling
      const [propertiesResult, tenantsResult, paymentsResult, remindersResult] = await Promise.allSettled([
        Property.find(propertyFilter).select('numberOfUnits').lean().exec(),
        Tenant.find(tenantFilter).select('status').lean().exec(),
        Payment.find({ 
          ...paymentFilter,
          paymentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).select('amount paymentDate status').sort({ paymentDate: -1 }).limit(50).lean().exec(),
        Reminder.countDocuments({ organizationId, status: 'active', type: 'maintenance_reminder' }).exec()
      ]);

      const properties = propertiesResult.status === 'fulfilled' ? propertiesResult.value : [];
      const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
      const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value : [];
      const pendingMaintenance = remindersResult.status === 'fulfilled' ? remindersResult.value : 0;

      // Calculate occupancy rate
      const totalUnits = properties.reduce((sum, prop) => sum + (prop.numberOfUnits || 1), 0);
      const occupiedUnits = tenants.filter(t => ['Active', 'Late'].includes(t.status)).length;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      // Calculate monthly revenue
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlyPayments = payments.filter(p => 
        p.paymentDate && new Date(p.paymentDate) >= currentMonth && 
        ['Paid', 'completed', 'Completed'].includes(p.status)
      );
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Recent payments count
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPayments = payments.filter(p => 
        p.paymentDate && new Date(p.paymentDate) >= last24Hours &&
        ['Paid', 'completed', 'Completed'].includes(p.status)
      ).length;

      const result = {
        totalProperties: properties.length,
        totalTenants: tenants.length,
        monthlyRevenue,
        occupancyRate,
        pendingMaintenance,
        recentPayments
      };
      
      console.log('Dashboard stats calculated:', result);
      return result;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        totalProperties: 0,
        totalTenants: 0,
        monthlyRevenue: 0,
        occupancyRate: 0,
        pendingMaintenance: 0,
        recentPayments: 0
      };
    }
  }

  async getCashFlowData(organizationId: string, period: string = 'monthly') {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const payments = await Payment.find({ 
        organizationId,
        paymentDate: { $gte: sixMonthsAgo },
        status: { $in: ['Paid', 'completed', 'Completed'] }
      })
      .select('amount paymentDate')
      .sort({ paymentDate: -1 })
      .lean()
      .exec();

      // Group by month
      const monthlyData = payments.reduce((acc: any, payment) => {
        if (!payment.paymentDate) return acc;
        const month = new Date(payment.paymentDate).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
        acc[month].income += (payment.amount || 0);
        return acc;
      }, {});

      return Object.entries(monthlyData)
        .map(([month, data]: [string, any]) => ({
          month,
          income: data.income,
          expenses: data.expenses
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);
    } catch (error) {
      console.error('Cash flow data error:', error);
      return [];
    }
  }

  async getUpcomingReminders(organizationId: string) {
    try {
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const upcoming = await Reminder.find({
        organizationId,
        status: 'active',
        nextRunDate: { $gte: new Date(), $lte: sevenDaysFromNow }
      })
      .populate('tenantId', 'name unit')
      .populate('propertyId', 'name')
      .select('type message nextRunDate tenantId propertyId')
      .sort({ nextRunDate: 1 })
      .limit(10)
      .lean()
      .exec();

      return upcoming || [];
    } catch (error) {
      console.error('Upcoming reminders error:', error);
      return [];
    }
  }
}

export default new DashboardService();