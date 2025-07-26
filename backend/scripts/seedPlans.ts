import mongoose from 'mongoose';
import Plan from '../models/Plan';

const seedPlans = async () => {
  try {
    await Plan.deleteMany({});
    
    const plans = [
      {
        name: 'Basic',
        price: 29,
        features: ['Up to 5 properties', 'Basic reporting', 'Email support'],
        isActive: true,
        maxProperties: 5,
        maxTenants: 20
      },
      {
        name: 'Premium',
        price: 99,
        features: ['Up to 50 properties', 'Advanced reporting', 'Priority support', 'Maintenance tracking'],
        isActive: true,
        maxProperties: 50,
        maxTenants: 200
      },
      {
        name: 'Enterprise',
        price: 299,
        features: ['Unlimited properties', 'Custom reporting', '24/7 support', 'API access'],
        isActive: true,
        maxProperties: -1,
        maxTenants: -1
      }
    ];

    await Plan.insertMany(plans);
    console.log('Plans seeded successfully');
  } catch (error) {
    console.error('Error seeding plans:', error);
  }
};

export default seedPlans;