import mongoose from 'mongoose';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function fixSubscriptionFlow() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create organizations for users without them
    const usersWithoutOrg = await User.find({ 
      organizationId: { $exists: false },
      role: { $ne: 'Super Admin' }
    });

    console.log(`Found ${usersWithoutOrg.length} users without organizations`);

    for (const user of usersWithoutOrg) {
      const org = await Organization.create({
        name: `${user.name}'s Organization`,
        owner: user._id,
        members: [user._id],
        status: 'active'
      });

      user.organizationId = org._id;
      await user.save();
      console.log(`Created organization for user: ${user.email}`);
    }

    // 2. Create trial subscriptions for organizations without them
    const basicPlan = await Plan.findOne({ name: 'Basic Plan' });
    if (!basicPlan) {
      console.log('No basic plan found, creating one...');
      const newPlan = await Plan.create({
        name: 'Basic Plan',
        price: 2900,
        duration: 'monthly',
        trialDays: 14,
        maxProperties: 5,
        maxTenants: 25,
        maxUsers: 2,
        maxAgents: 1
      });
      console.log('Basic plan created');
    }

    const orgsWithoutSub = await Organization.find({});
    for (const org of orgsWithoutSub) {
      const existingSub = await Subscription.findOne({ organizationId: org._id });
      if (!existingSub && basicPlan) {
        const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        
        await Subscription.create({
          organizationId: org._id,
          planId: basicPlan._id,
          status: 'trialing',
          trialExpiresAt,
          currentPeriodEndsAt: trialExpiresAt,
          amount: basicPlan.price,
          currency: 'USD',
          billingCycle: 'monthly',
          maxProperties: basicPlan.maxProperties,
          maxTenants: basicPlan.maxTenants,
          maxUsers: basicPlan.maxUsers,
          maxAgents: basicPlan.maxAgents
        });
        
        console.log(`Created trial subscription for org: ${org.name}`);
      }
    }

    console.log('✅ Subscription flow fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing subscription flow:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

if (require.main === module) {
  fixSubscriptionFlow();
}

export default fixSubscriptionFlow;