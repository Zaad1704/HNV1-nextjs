import Subscription from '../models/Subscription';
import Organization from '../models/Organization';
import cron from 'node-cron';

class SubscriptionService {
  
  // Check subscription status and update if needed
  async checkSubscriptionStatus(organizationId: string) {
    try {
      const subscription = await Subscription.findOne({ organizationId }).populate('planId');
      
      if (!subscription) {
        return { isActive: false, reason: 'No subscription found' };
      }

      const now = new Date();
      
      // Check if subscription is expired
      if (subscription.currentPeriodEnd < now && !subscription.isLifetime) {
        if (subscription.status !== 'expired') {
          subscription.status = 'expired';
          subscription.endedAt = now;
          await subscription.save();
          
          // Update organization status
          await Organization.findByIdAndUpdate(organizationId, { status: 'inactive' });
        }
        return { isActive: false, reason: 'Subscription expired' };
      }

      // Check if subscription is canceled and period ended
      if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd < now) {
        subscription.status = 'canceled';
        subscription.endedAt = now;
        await subscription.save();
        
        await Organization.findByIdAndUpdate(organizationId, { status: 'inactive' });
        return { isActive: false, reason: 'Subscription canceled' };
      }

      // Check trial expiration
      if (subscription.status === 'trialing' && subscription.trialEnd && subscription.trialEnd < now) {
        subscription.status = 'expired';
        await subscription.save();
        
        await Organization.findByIdAndUpdate(organizationId, { status: 'inactive' });
        return { isActive: false, reason: 'Trial expired' };
      }

      // Check for past due payments
      if (subscription.failedPaymentAttempts >= 3) {
        subscription.status = 'past_due';
        await subscription.save();
        
        await Organization.findByIdAndUpdate(organizationId, { status: 'inactive' });
        return { isActive: false, reason: 'Payment past due' };
      }

      return { 
        isActive: subscription.status === 'active' || subscription.status === 'trialing',
        subscription,
        daysUntilExpiry: Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      };
    } catch (error) {
      console.error('Check subscription status error:', error);
      return { isActive: false, reason: 'Error checking subscription' };
    }
  }

  // Check if user can perform action based on limits
  async checkUsageLimit(organizationId: string, limitType: 'properties' | 'tenants' | 'users' | 'exports' | 'storage') {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      
      if (!subscription) {
        return { allowed: false, reason: 'No subscription found' };
      }

      const currentUsage = subscription.usage[limitType];
      const limit = subscription.limits[limitType];

      if (currentUsage >= limit) {
        return { 
          allowed: false, 
          reason: `${limitType} limit reached (${currentUsage}/${limit})`,
          currentUsage,
          limit
        };
      }

      return { 
        allowed: true, 
        currentUsage, 
        limit,
        remaining: limit - currentUsage
      };
    } catch (error) {
      console.error('Check usage limit error:', error);
      return { allowed: false, reason: 'Error checking usage limit' };
    }
  }

  // Update usage count
  async updateUsage(organizationId: string, limitType: 'properties' | 'tenants' | 'users' | 'exports' | 'storage', increment: number = 1) {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      
      if (!subscription) {
        return false;
      }

      subscription.usage[limitType] += increment;
      await subscription.save();
      
      return true;
    } catch (error) {
      console.error('Update usage error:', error);
      return false;
    }
  }

  // Reset monthly usage counters
  async resetMonthlyUsage() {
    try {
      const now = new Date();
      const subscriptions = await Subscription.find({
        'usage.lastReset': { $lt: new Date(now.getFullYear(), now.getMonth(), 1) }
      });

      for (const subscription of subscriptions) {
        subscription.usage.exports = 0;
        subscription.usage.lastReset = now;
        await subscription.save();
      }

      console.log(`Reset monthly usage for ${subscriptions.length} subscriptions`);
    } catch (error) {
      console.error('Reset monthly usage error:', error);
    }
  }

  // Get subscription countdown info
  async getSubscriptionCountdown(organizationId: string) {
    try {
      const subscription = await Subscription.findOne({ organizationId }).populate('planId');
      
      if (!subscription) {
        return null;
      }

      const now = new Date();
      const endDate = subscription.currentPeriodEnd;
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60));

      return {
        daysRemaining: Math.max(0, daysRemaining),
        hoursRemaining: Math.max(0, hoursRemaining),
        endDate,
        isExpiringSoon: daysRemaining <= 7,
        isExpired: daysRemaining <= 0,
        billingCycle: subscription.billingCycle,
        nextBillingDate: subscription.nextBillingDate,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      };
    } catch (error) {
      console.error('Get subscription countdown error:', error);
      return null;
    }
  }

  // Create trial subscription
  async createTrialSubscription(organizationId: string, planId: string) {
    try {
      const subscription = new Subscription({
        organizationId,
        planId,
        status: 'trialing',
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
      return await subscription.save();
    } catch (error) {
      console.error('Create trial subscription error:', error);
      throw error;
    }
  }

  // Get subscription status
  async getSubscriptionStatus(organizationId: string) {
    return await this.checkSubscriptionStatus(organizationId);
  }

  // Activate subscription
  async activateSubscription(subscriptionId: string) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (subscription) {
        subscription.status = 'active';
        await subscription.save();
      }
      return subscription;
    } catch (error) {
      console.error('Activate subscription error:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (subscription) {
        subscription.cancelAtPeriodEnd = true;
        await subscription.save();
      }
      return subscription;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  // Reactivate subscription
  async reactivateSubscription(subscriptionId: string) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (subscription) {
        subscription.status = 'active';
        subscription.cancelAtPeriodEnd = false;
        await subscription.save();
      }
      return subscription;
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      throw error;
    }
  }

  // Check expired subscriptions
  async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await Subscription.find({
        status: { $in: ['active', 'trialing'] },
        currentPeriodEnd: { $lt: new Date() },
        isLifetime: false
      });

      for (const subscription of expiredSubscriptions) {
        await this.checkSubscriptionStatus(subscription.organizationId.toString());
      }

      return expiredSubscriptions.length;
    } catch (error) {
      console.error('Check expired subscriptions error:', error);
      return 0;
    }
  }

  // Initialize cron jobs for subscription management
  initializeCronJobs() {
    // Check expired subscriptions daily at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Running daily subscription check...');
      
      try {
        const expiredSubscriptions = await Subscription.find({
          status: { $in: ['active', 'trialing'] },
          currentPeriodEnd: { $lt: new Date() },
          isLifetime: false
        });

        for (const subscription of expiredSubscriptions) {
          await this.checkSubscriptionStatus(subscription.organizationId.toString());
        }

        console.log(`Processed ${expiredSubscriptions.length} expired subscriptions`);
      } catch (error) {
        console.error('Daily subscription check error:', error);
      }
    });

    // Reset monthly usage counters on the 1st of each month
    cron.schedule('0 0 1 * *', async () => {
      console.log('Resetting monthly usage counters...');
      await this.resetMonthlyUsage();
    });

    // Send expiration warnings 7 days before expiry
    cron.schedule('0 9 * * *', async () => {
      console.log('Checking for subscriptions expiring soon...');
      
      try {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const expiringSoon = await Subscription.find({
          status: 'active',
          currentPeriodEnd: { $lte: sevenDaysFromNow, $gt: new Date() },
          cancelAtPeriodEnd: false
        }).populate('organizationId');

        // TODO: Send expiration warning emails
        console.log(`Found ${expiringSoon.length} subscriptions expiring within 7 days`);
      } catch (error) {
        console.error('Expiration warning check error:', error);
      }
    });
  }
}

export default new SubscriptionService();