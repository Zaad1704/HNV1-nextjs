import Plan from '../models/Plan';
import SiteSettings from '../models/SiteSettings';

class MasterDataService {
  async initializeSystemData() {
    try {
      await this.ensureDefaultPlans();
      await this.ensureDefaultSiteSettings();
      console.log('✅ Master data initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize master data:', error);
    }
  }

  private async ensureDefaultPlans() {
    try {
      const existingPlans = await Plan.countDocuments();
      if (existingPlans === 0) {
        const defaultPlans = [
          {
            name: 'Free Trial',
            price: 0,
            interval: 'month',
            features: ['Up to 5 properties', 'Basic reporting', '14-day trial'],
            maxProperties: 5,
            maxTenants: 20,
            isActive: true,
            isTrial: true,
            trialDays: 14
          },
          {
            name: 'Basic',
            price: 29,
            interval: 'month',
            features: ['Up to 25 properties', 'Advanced reporting', 'Email support'],
            maxProperties: 25,
            maxTenants: 100,
            isActive: true
          },
          {
            name: 'Professional',
            price: 79,
            interval: 'month',
            features: ['Up to 100 properties', 'Premium features', 'Priority support'],
            maxProperties: 100,
            maxTenants: 500,
            isActive: true
          }
        ];

        await Plan.insertMany(defaultPlans);
        console.log('✅ Default plans created');
      }
    } catch (error) {
      console.error('❌ Failed to create default plans:', error);
    }
  }

  private async ensureDefaultSiteSettings() {
    try {
      const existingSettings = await SiteSettings.findOne();
      if (!existingSettings) {
        const defaultSettings = new SiteSettings({
          siteName: 'HNV Property Management',
          siteDescription: 'Complete Property Management SaaS Solution',
          contactEmail: 'contact@hnvpm.com',
          supportEmail: 'support@hnvpm.com',
          maintenanceMode: false,
          allowRegistration: true,
          defaultTrialDays: 14,
          features: {
            enablePayments: true,
            enableNotifications: true,
            enableReports: true
          }
        });
        
        await defaultSettings.save();
        console.log('✅ Default site settings created');
      }
    } catch (error) {
      console.error('❌ Failed to create default site settings:', error);
    }
  }

  async getSystemStats() {
    try {
      const stats = {
        totalPlans: await Plan.countDocuments(),
        activePlans: await Plan.countDocuments({ isActive: true }),
        timestamp: new Date().toISOString()
      };
      return stats;
    } catch (error) {
      console.error('❌ Failed to get system stats:', error);
      return null;
    }
  }
}

export default new MasterDataService();