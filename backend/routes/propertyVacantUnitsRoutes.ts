import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Property from '../models/Property';
import Tenant from '../models/Tenant';

const router = Router();

router.use(protect);

// Get vacant units for a property
router.get('/:propertyId/vacant-units', async (req: any, res) => {
  try {
    const { propertyId } = req.params;
    
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Get occupied units
    const occupiedTenants = await Tenant.find({ 
      propertyId, 
      status: { $in: ['Active', 'Late'] } 
    }).select('unit');
    
    const occupiedUnits = occupiedTenants.map(t => t.unit);

    // Get all previous tenants for rent history
    const allPreviousTenants = await Tenant.find({ propertyId })
      .sort({ createdAt: -1 })
      .select('unit rentAmount');

    // Create vacant units list
    const vacantUnits = [];
    const totalUnits = property.totalUnits || 10; // Default to 10 if not specified

    for (let i = 1; i <= totalUnits; i++) {
      const unitNumber = `${i}`;
      if (!occupiedUnits.includes(unitNumber)) {
        // Find last rent amount for this unit
        const lastTenant = allPreviousTenants.find(t => t.unit === unitNumber);
        
        vacantUnits.push({
          unitNumber,
          lastRentAmount: lastTenant?.rentAmount || null,
          suggestedRent: property.rentAmount || null
        });
      }
    }

    res.status(200).json({ success: true, data: vacantUnits });
  } catch (error) {
    console.error('Get vacant units error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;