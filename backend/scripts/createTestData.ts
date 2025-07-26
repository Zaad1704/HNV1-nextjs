import mongoose from 'mongoose';
import Organization from '../models/Organization';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';

const createTestData = async () => {
  try {
    console.log('Creating test data...');

    // Find first organization
    const org = await Organization.findOne();
    if (!org) {
      console.log('No organization found. Please create an organization first.');
      return;
    }

    console.log(`Using organization: ${org.name}`);

    // Create test property if none exists
    let property = await Property.findOne({ organizationId: org._id });
    if (!property) {
      property = await Property.create({
        name: 'Test Property',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        numberOfUnits: 10,
        organizationId: org._id
      });
      console.log('Created test property');
    }

    // Create test tenant if none exists
    let tenant = await Tenant.findOne({ organizationId: org._id });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'John Doe',
        email: 'john@test.com',
        phone: '555-0123',
        unit: 'A1',
        rentAmount: 1200,
        status: 'Active',
        propertyId: property._id,
        organizationId: org._id
      });
      console.log('Created test tenant');
    }

    // Create test payments
    const existingPayments = await Payment.countDocuments({ organizationId: org._id });
    if (existingPayments === 0) {
      const payments = [];
      for (let i = 0; i < 5; i++) {
        payments.push({
          tenantId: tenant._id,
          propertyId: property._id,
          amount: 1200,
          paymentDate: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)),
          status: i === 0 ? 'Pending' : 'Paid',
          organizationId: org._id,
          transactionId: `TXN${Date.now()}${i}`
        });
      }
      
      await Payment.insertMany(payments);
      console.log(`Created ${payments.length} test payments`);
    }

    // Create plan and subscription
    let plan = await Plan.findOne();
    if (!plan) {
      plan = await Plan.create({
        name: 'Premium',
        price: 9900,
        interval: 'monthly',
        features: ['Unlimited Properties', 'Payment Tracking', 'Reports'],
        isActive: true
      });
      console.log('Created test plan');
    }

    const existingSub = await Subscription.findOne({ organizationId: org._id });
    if (!existingSub) {
      await Subscription.create({
        organizationId: org._id,
        planId: plan._id,
        status: 'active',
        currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      console.log('Created test subscription');
    }

    console.log('✅ Test data creation completed');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hnv')
    .then(() => createTestData())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default createTestData;