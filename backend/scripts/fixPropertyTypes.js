const mongoose = require('mongoose');
const path = require('path');
require('ts-node/register');
const Property = require('../models/Property.ts').default;

async function fixPropertyTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hnv1');
    
    // Update properties without propertyType
    const result = await Property.updateMany(
      { $or: [{ propertyType: { $exists: false } }, { propertyType: null }, { propertyType: '' }] },
      { $set: { propertyType: 'Apartment' } }
    );
    
    console.log(`Updated ${result.modifiedCount} properties with default propertyType`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing property types:', error);
  }
}

fixPropertyTypes();