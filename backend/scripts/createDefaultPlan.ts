import mongoose from 'mongoose';
import Plan from '../models/Plan';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function createDefaultPlan() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if basic plan exists
    const existingPlan = await Plan.findOne({ name: 'Basic Plan' });
    if (existingPlan) {
      console.log('Basic plan already exists');
      return;
    }

    // Create basic plan
    const basicPlan = await Plan.create({
      name: 'Basic Plan',
      description: 'Perfect for small landlords',
      price: 2900, // $29.00
      duration: 'monthly',
      interval: 'monthly',
      features: [
        'Up to 5 properties',
        'Up to 25 tenants',
        'Basic reporting',
        'Email support'
      ],
      maxProperties: 5,
      maxUsers: 2,
      maxTenants: 25,
      maxAgents: 1,
      isPublic: true,
      isActive: true,
      trialDays: 14,
      currency: 'USD',
      billingCycle: 'monthly',
      planType: 'basic',
      allowedFeatures: {
        analytics: false,
        multipleProperties: true,
        tenantPortal: true,
        maintenanceTracking: true,
        financialReporting: false,
        documentStorage: false,
        apiAccess: false,
        customBranding: false,
        prioritySupport: false
      }
    });

    console.log('✅ Basic plan created:', basicPlan.name);

  } catch (error) {
    console.error('❌ Error creating default plan:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

if (require.main === module) {
  createDefaultPlan();
}

export default createDefaultPlan;