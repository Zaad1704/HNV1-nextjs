import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import { generatePropertyDetailsPdf, generatePropertyFinancialSummary } from '../utils/propertyPdfGenerator';

const router = Router();

router.use(protect);

// Generate property details PDF
router.get('/:id/details-pdf', async (req: any, res) => {
  try {
    const propertyId = req.params.id;
    
    // Validate property ID format
    if (!propertyId || !propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID format' });
    }

    const property = await Property.findById(propertyId)
      .populate('createdBy', 'name')
      .populate('managedByAgentId', 'name')
      .lean();

    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Get tenants for this property
    const tenants = await Tenant.find({ 
      propertyId: propertyId, 
      organizationId: req.user.organizationId 
    }).lean();

    // Get recent payments for this property
    const recentPayments = await Payment.find({ 
      propertyId: propertyId, 
      organizationId: req.user.organizationId 
    })
    .populate('tenantId', 'name')
    .sort({ paymentDate: -1 })
    .limit(10)
    .lean();

    // Combine data
    const propertyData = {
      ...property,
      tenants,
      recentPayments
    };

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Property_Details_${property.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    // Generate PDF and pipe to response
    generatePropertyDetailsPdf(propertyData, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Property PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate property PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate property financial summary PDF
router.get('/:id/financial-pdf', async (req: any, res) => {
  try {
    const propertyId = req.params.id;
    
    // Validate property ID format
    if (!propertyId || !propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID format' });
    }

    const property = await Property.findById(propertyId).lean();

    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Get financial data
    const tenants = await Tenant.find({ 
      propertyId: propertyId, 
      organizationId: req.user.organizationId,
      status: 'Active'
    }).lean();

    const payments = await Payment.find({ 
      propertyId: propertyId, 
      organizationId: req.user.organizationId,
      paymentDate: { 
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Current month
      }
    }).lean();

    const expenses = await Expense.find({ 
      propertyId: propertyId, 
      organizationId: req.user.organizationId,
      date: { 
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Current month
      }
    }).lean();

    // Combine financial data
    const propertyData = {
      ...property,
      tenants,
      payments,
      expenses
    };

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Property_Financial_${property.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    // Generate PDF and pipe to response
    generatePropertyFinancialSummary(propertyData, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Property financial PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate property financial PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;