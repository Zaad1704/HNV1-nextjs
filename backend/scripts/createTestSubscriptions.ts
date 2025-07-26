import mongoose from 'mongoose';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

const createTestSubscriptions = async () => {
  try {
    console.log('Creating test subscriptions...');

    // Find all organizations without subscriptions
    const orgsWithoutSubs = await Organization.find({}).lean();
    
    // Find or create a default plan
    let defaultPlan = await Plan.findOne({ name: 'Premium' });
    if (!defaultPlan) {
      defaultPlan = await Plan.create({
        name: 'Premium',
        price: 9900, // $99.00
        interval: 'monthly',
        features: [
          'Unlimited Properties',
          'Unlimited Tenants',
          'Payment Tracking',
          'Maintenance Requests',
          'Financial Reports',
          'Email Support'
        ],
        isActive: true,
        trialDays: 14
      });
      console.log('Created default Premium plan');
    }

    let createdCount = 0;
    
    for (const org of orgsWithoutSubs) {
      // Check if subscription already exists
      const existingSub = await Subscription.findOne({ organizationId: org._id });
      
      if (!existingSub) {
        // Create active subscription
        const subscription = await Subscription.create({
          organizationId: org._id,
          planId: defaultPlan._id,
          status: 'active',
          currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isLifetime: false
        });
        
        console.log(`Created subscription for organization: ${org.name}`);
        createdCount++;
      }
    }

    console.log(`✅ Created ${createdCount} test subscriptions`);
    console.log(`📊 Total organizations: ${orgsWithoutSubs.length}`);
    
  } catch (error) {
    console.error('Error creating test subscriptions:', error);
  }
};

// Run if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hnv')
    .then(() => {
      console.log('Connected to MongoDB');
      return createTestSubscriptions();
    })
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default createTestSubscriptions;