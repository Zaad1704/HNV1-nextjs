const mongoose = require('mongoose');
require('dotenv').config();

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  features: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

async function createBasicPlans() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if plans exist
    const existingPlans = await Plan.countDocuments();
    if (existingPlans > 0) {
      console.log('Plans already exist:', existingPlans);
      process.exit(0);
    }

    // Create basic plans
    const plans = [
      {
        name: 'Free Trial',
        price: 0,
        duration: 'monthly',
        features: ['Basic property management', 'Up to 2 properties', 'Basic support'],
        isActive: true
      },
      {
        name: 'Starter',
        price: 2900, // $29.00
        duration: 'monthly',
        features: ['Up to 10 properties', 'Unlimited tenants', 'Payment tracking', 'Basic reports'],
        isActive: true
      },
      {
        name: 'Professional',
        price: 5900, // $59.00
        duration: 'monthly',
        features: ['Up to 50 properties', 'Advanced analytics', 'Maintenance management', 'Priority support'],
        isActive: true
      },
      {
        name: 'Enterprise',
        price: 9900, // $99.00
        duration: 'monthly',
        features: ['Unlimited properties', 'Custom branding', 'API access', 'Dedicated support'],
        isActive: true
      }
    ];

    await Plan.insertMany(plans);
    console.log('✅ Basic plans created successfully');
    
    const createdPlans = await Plan.find();
    console.log('Created plans:', createdPlans.map(p => ({ name: p.name, price: p.price })));
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating plans:', error);
    process.exit(1);
  }
}

createBasicPlans();