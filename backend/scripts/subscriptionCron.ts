import cron from 'node-cron';
import subscriptionService from '../services/subscriptionService';
import automationService from '../services/automationService';

// Run every day at midnight for all automation tasks
export const startSubscriptionCron = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily automation tasks...');
      
      // Check expired subscriptions
      const expiredCount = await subscriptionService.checkExpiredSubscriptions();
      console.log(`Updated ${expiredCount} expired subscriptions`);
      
      // Run business automation
      await automationService.runDailyTasks();
      
      // Update occupancy rates
      await automationService.updateOccupancyRates();
      
      console.log('Daily automation completed successfully');
    } catch (error) {
      console.error('Error in daily automation:', error);
    }
  });
  
  console.log('Daily automation cron job started');
};