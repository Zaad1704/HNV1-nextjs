import mongoose from 'mongoose';
import User from '../models/User';
import Organization from '../models/Organization';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Reminder from '../models/Reminder';
import AuditLog from '../models/AuditLog';
import Notification from '../models/Notification';
import Expense from '../models/Expense';
import Plan from '../models/Plan';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function fixModelsAndIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create indexes for all models
    console.log('Creating indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ organizationId: 1 });
    await User.collection.createIndex({ role: 1 });
    
    // Organization indexes
    await Organization.collection.createIndex({ owner: 1 });
    await Organization.collection.createIndex({ status: 1 });
    
    // Property indexes
    await Property.collection.createIndex({ organizationId: 1 });
    await Property.collection.createIndex({ createdBy: 1 });
    await Property.collection.createIndex({ status: 1 });
    await Property.collection.createIndex({ 'location': '2dsphere' });
    
    // Tenant indexes
    await Tenant.collection.createIndex({ organizationId: 1 });
    await Tenant.collection.createIndex({ propertyId: 1 });
    await Tenant.collection.createIndex({ email: 1 });
    await Tenant.collection.createIndex({ status: 1 });
    
    // Payment indexes
    await Payment.collection.createIndex({ organizationId: 1, paymentDate: -1 });
    await Payment.collection.createIndex({ tenantId: 1, status: 1 });
    await Payment.collection.createIndex({ propertyId: 1, paymentDate: -1 });
    
    // Subscription indexes
    await Subscription.collection.createIndex({ organizationId: 1 });
    await Subscription.collection.createIndex({ status: 1 });
    await Subscription.collection.createIndex({ nextBillingDate: 1 });
    
    // MaintenanceRequest indexes
    await MaintenanceRequest.collection.createIndex({ organizationId: 1, status: 1 });
    await MaintenanceRequest.collection.createIndex({ propertyId: 1, createdAt: -1 });
    await MaintenanceRequest.collection.createIndex({ assignedTo: 1, status: 1 });
    
    // Reminder indexes
    await Reminder.collection.createIndex({ organizationId: 1 });
    await Reminder.collection.createIndex({ tenantId: 1, status: 1 });
    await Reminder.collection.createIndex({ nextRunDate: 1, status: 1 });
    
    // AuditLog indexes
    await AuditLog.collection.createIndex({ organizationId: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ userId: 1, timestamp: -1 });
    
    // Notification indexes
    await Notification.collection.createIndex({ userId: 1, isRead: 1 });
    await Notification.collection.createIndex({ userId: 1, createdAt: -1 });
    await Notification.collection.createIndex({ organizationId: 1, createdAt: -1 });
    
    // Expense indexes
    await Expense.collection.createIndex({ organizationId: 1, date: -1 });
    await Expense.collection.createIndex({ propertyId: 1, date: -1 });
    
    // Plan indexes
    await Plan.collection.createIndex({ name: 1 }, { unique: true });
    await Plan.collection.createIndex({ isActive: 1, isPublic: 1 });

    console.log('✅ All indexes created successfully');

    // Fix data inconsistencies
    console.log('Fixing data inconsistencies...');
    
    // Update payment status values to be consistent
    await Payment.updateMany(
      { status: 'completed' },
      { $set: { status: 'Completed' } }
    );
    
    await Payment.updateMany(
      { status: 'paid' },
      { $set: { status: 'Paid' } }
    );

    // Ensure all payments have organizationId
    const paymentsWithoutOrg = await Payment.find({ organizationId: { $exists: false } });
    for (const payment of paymentsWithoutOrg) {
      const tenant = await Tenant.findById(payment.tenantId);
      if (tenant && tenant.organizationId) {
        await Payment.findByIdAndUpdate(payment._id, {
          organizationId: tenant.organizationId
        });
      }
    }

    // Ensure all users have proper default values
    await User.updateMany(
      { permissions: { $exists: false } },
      { $set: { permissions: [] } }
    );

    await User.updateMany(
      { managedAgentIds: { $exists: false } },
      { $set: { managedAgentIds: [] } }
    );

    await User.updateMany(
      { passkeys: { $exists: false } },
      { $set: { passkeys: [] } }
    );

    console.log('✅ Data inconsistencies fixed');

    // Validate model relationships
    console.log('Validating model relationships...');
    
    const orphanedTenants = await Tenant.find({
      propertyId: { $nin: await Property.distinct('_id') }
    });
    
    if (orphanedTenants.length > 0) {
      console.warn(`⚠️ Found ${orphanedTenants.length} orphaned tenants`);
    }

    const orphanedPayments = await Payment.find({
      tenantId: { $nin: await Tenant.distinct('_id') }
    });
    
    if (orphanedPayments.length > 0) {
      console.warn(`⚠️ Found ${orphanedPayments.length} orphaned payments`);
    }

    console.log('✅ Model validation complete');
    console.log('🎉 All models and indexes fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing models and indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  fixModelsAndIndexes();
}

export default fixModelsAndIndexes;