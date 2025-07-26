import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Property from '../models/Property';

const router = Router();

router.use(protect);

// Get unit details overview
router.get('/:propertyId/units/:unitNumber', async (req: any, res) => {
  try {
    const { propertyId, unitNumber } = req.params;
    
    const property = await Property.findOne({
      _id: propertyId,
      organizationId: req.user.organizationId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Get current tenant
    const currentTenant = await Tenant.findOne({
      propertyId,
      unit: unitNumber,
      organizationId: req.user.organizationId,
      status: 'Active'
    });

    // Get all tenants for this unit (history)
    const allTenants = await Tenant.find({
      propertyId,
      unit: unitNumber,
      organizationId: req.user.organizationId
    });

    // Get all payments for this unit
    const payments = await Payment.find({
      propertyId,
      organizationId: req.user.organizationId
    }).populate('tenantId', 'name unit');
    
    const unitPayments = payments.filter(p => {
      const tenant = p.tenantId as any;
      return tenant?.unit === unitNumber;
    });

    const totalPayments = unitPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = 0; // TODO: Add expense calculation

    res.status(200).json({
      success: true,
      data: {
        property,
        unitNumber,
        currentTenant,
        totalTenants: allTenants.length,
        totalPayments,
        totalExpenses
      }
    });
  } catch (error) {
    console.error('Unit details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unit tenants history
router.get('/:propertyId/units/:unitNumber/tenants', async (req: any, res) => {
  try {
    const { propertyId, unitNumber } = req.params;
    
    const tenants = await Tenant.find({
      propertyId,
      unit: unitNumber,
      organizationId: req.user.organizationId
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    console.error('Unit tenants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unit payments history
router.get('/:propertyId/units/:unitNumber/payments', async (req: any, res) => {
  try {
    const { propertyId, unitNumber } = req.params;
    
    const payments = await Payment.find({
      propertyId,
      organizationId: req.user.organizationId
    }).populate('tenantId', 'name unit').sort({ paymentDate: -1 });

    const unitPayments = payments.filter(p => {
      const tenant = p.tenantId as any;
      return tenant?.unit === unitNumber;
    });

    res.status(200).json({ success: true, data: unitPayments });
  } catch (error) {
    console.error('Unit payments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unit receipts history
router.get('/:propertyId/units/:unitNumber/receipts', async (req: any, res) => {
  try {
    const { propertyId, unitNumber } = req.params;
    
    const Receipt = require('../models/Receipt').default;
    const receipts = await Receipt.find({
      propertyId,
      organizationId: req.user.organizationId
    }).sort({ paymentDate: -1 });

    const unitReceipts = receipts.filter((receipt: any) => receipt.unitNumber === unitNumber);

    res.status(200).json({ success: true, data: unitReceipts });
  } catch (error) {
    console.error('Unit receipts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;