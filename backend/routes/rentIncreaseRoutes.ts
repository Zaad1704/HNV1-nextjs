import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Property from '../models/Property';
import Tenant from '../models/Tenant';

const router = Router();

router.use(protect);

// Apply rent increase
router.post('/', async (req: any, res) => {
  try {
    const { 
      type, 
      propertyId, 
      tenantId, 
      increaseType, 
      amount, 
      percentage, 
      effectiveDate, 
      reason 
    } = req.body;

    if (type === 'property' && propertyId) {
      // Update all tenants in the property
      const tenants = await Tenant.find({ propertyId, status: 'Active' });
      
      for (const tenant of tenants) {
        const currentRent = tenant.rentAmount || 0;
        const newRent = increaseType === 'percentage' 
          ? currentRent * (1 + percentage / 100)
          : currentRent + amount;
        
        await Tenant.findByIdAndUpdate(tenant._id, {
          rentAmount: Math.round(newRent * 100) / 100,
          lastRentIncrease: {
            date: new Date(effectiveDate),
            oldAmount: currentRent,
            newAmount: Math.round(newRent * 100) / 100,
            type: increaseType,
            value: increaseType === 'percentage' ? percentage : amount,
            reason
          }
        });
      }

      // Update property base rent
      const property = await Property.findById(propertyId);
      if (property) {
        const currentPropertyRent = property.rentAmount || 0;
        const newPropertyRent = increaseType === 'percentage'
          ? currentPropertyRent * (1 + percentage / 100)
          : currentPropertyRent + amount;
        
        await Property.findByIdAndUpdate(propertyId, {
          rentAmount: Math.round(newPropertyRent * 100) / 100
        });
      }

    } else if (type === 'tenant' && tenantId) {
      // Update specific tenant
      const tenant = await Tenant.findById(tenantId);
      if (tenant) {
        const currentRent = tenant.rentAmount || 0;
        const newRent = increaseType === 'percentage'
          ? currentRent * (1 + percentage / 100)
          : currentRent + amount;
        
        await Tenant.findByIdAndUpdate(tenantId, {
          rentAmount: Math.round(newRent * 100) / 100,
          lastRentIncrease: {
            date: new Date(effectiveDate),
            oldAmount: currentRent,
            newAmount: Math.round(newRent * 100) / 100,
            type: increaseType,
            value: increaseType === 'percentage' ? percentage : amount,
            reason
          }
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Rent increase applied successfully' 
    });
  } catch (error) {
    console.error('Rent increase error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;