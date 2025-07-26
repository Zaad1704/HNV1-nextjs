import mongoose from 'mongoose';
import Property from '../models/Property';
import Unit from '../models/Unit';
import Tenant from '../models/Tenant';

const initializeUnits = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hnv1');
    
    const properties = await Property.find({});
    console.log(`Found ${properties.length} properties`);
    
    for (const property of properties) {
      const existingUnits = await Unit.find({ propertyId: property._id });
      
      if (existingUnits.length === 0) {
        const numberOfUnits = property.numberOfUnits || 1;
        const units = [];
        
        for (let i = 1; i <= numberOfUnits; i++) {
          units.push({
            propertyId: property._id,
            organizationId: property.organizationId,
            unitNumber: i.toString(),
            status: 'Available'
          });
        }
        
        await Unit.insertMany(units);
        console.log(`Created ${units.length} units for property: ${property.name}`);
      }
    }
    
    console.log('Unit initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing units:', error);
    process.exit(1);
  }
};

initializeUnits();