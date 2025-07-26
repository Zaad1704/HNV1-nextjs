import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Reminder from '../models/Reminder';
import Property from '../models/Property';
import notificationService from './notificationService';

class AutomationService {
  // Run daily automation tasks
  async runDailyTasks() {
    try {
      await this.checkOverdueRent();
      await this.checkExpiringLeases();
      await this.processReminders();
      console.log('Daily automation tasks completed');
    } catch (error) {
      console.error('Daily automation error:', error);
    }
  }

  // Check for overdue rent
  private async checkOverdueRent() {
    const today = new Date();
    const tenants = await Tenant.find({ status: 'Active' });

    for (const tenant of tenants) {
      const lastPayment = await Payment.findOne({
        tenantId: tenant._id,
        status: 'Paid'
      }).sort({ paymentDate: -1 });

      if (lastPayment) {
        const daysSincePayment = Math.floor(
          (today.getTime() - new Date(lastPayment.paymentDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        if (daysSincePayment > 30) {
          // Mark as late
          tenant.status = 'Late';
          await tenant.save();

          // Send notification
          await notificationService.notifyRentOverdue(
            tenant.name,
            daysSincePayment - 30,
            tenant.createdBy?.toString() || '',
            tenant.organizationId.toString()
          );

          // Create reminder if not exists
          const existingReminder = await Reminder.findOne({
            tenantId: tenant._id,
            type: 'rent_reminder',
            status: 'active'
          });

          if (!existingReminder) {
            await Reminder.create({
              organizationId: tenant.organizationId,
              tenantId: tenant._id,
              propertyId: tenant.propertyId,
              type: 'rent_reminder',
              message: `Rent payment overdue for ${tenant.name}`,
              nextRunDate: new Date(),
              frequency: 'weekly',
              status: 'active'
            });
          }
        }
      }
    }
  }

  // Check for expiring leases
  private async checkExpiringLeases() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringTenants = await Tenant.find({
      leaseEndDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
      status: 'Active'
    });

    for (const tenant of expiringTenants) {
      const daysLeft = Math.ceil(
        (new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      await notificationService.notifyLeaseExpiring(
        tenant.name,
        daysLeft,
        tenant.createdBy?.toString() || '',
        tenant.organizationId.toString()
      );
    }
  }

  // Process active reminders
  private async processReminders() {
    const dueReminders = await Reminder.find({
      status: 'active',
      nextRunDate: { $lte: new Date() }
    }).populate('tenantId').populate('propertyId');

    for (const reminder of dueReminders) {
      try {
        // Send notification based on reminder type
        if (reminder.type === 'rent_due') {
          const tenant = reminder.tenantId as any;
          await notificationService.notifyRentOverdue(
            tenant.name,
            0,
            reminder.createdBy?.toString() || '',
            reminder.organizationId.toString()
          );
        }

        // Update reminder for next run
        reminder.executionCount += 1;
        reminder.lastRunDate = new Date();
        
        // Calculate next run date based on frequency
        const nextRun = new Date();
        switch (reminder.frequency) {
          case 'daily':
            nextRun.setDate(nextRun.getDate() + 1);
            break;
          case 'weekly':
            nextRun.setDate(nextRun.getDate() + 7);
            break;
          case 'monthly':
            nextRun.setMonth(nextRun.getMonth() + 1);
            break;
        }
        
        reminder.nextRunDate = nextRun;
        await reminder.save();

      } catch (error) {
        console.error(`Error processing reminder ${reminder._id}:`, error);
      }
    }
  }

  // Update property occupancy rates
  async updateOccupancyRates() {
    const properties = await Property.find();
    
    for (const property of properties) {
      const occupiedUnits = await Tenant.countDocuments({
        propertyId: property._id,
        status: { $in: ['Active', 'Late'] }
      });

      property.occupancyRate = (occupiedUnits / property.numberOfUnits) * 100;
      await property.save();
    }
  }
}

export default new AutomationService();