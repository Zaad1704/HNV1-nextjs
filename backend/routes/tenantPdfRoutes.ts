import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import { generateTenantDetailsPdf, generateTenantLeaseAgreement, generateComprehensiveTenantPdf, generatePersonalDetailsPdf } from '../utils/tenantPdfGenerator';

const router = Router();

router.use(protect);

// Generate tenant details PDF
router.get('/:id/details-pdf', async (req: any, res) => {
  try {
    const tenantId = req.params.id;
    
    // Validate tenant ID format
    if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
    }

    const tenant = await Tenant.findById(tenantId)
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Get payment history for this tenant
    const payments = await Payment.find({ 
      tenantId: tenantId, 
      organizationId: req.user.organizationId 
    })
    .sort({ paymentDate: -1 })
    .limit(20)
    .lean();

    // Combine data
    const tenantData = {
      ...tenant,
      payments
    };

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Tenant_Details_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    // Generate PDF and pipe to response
    generateTenantDetailsPdf(tenantData, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Tenant PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate tenant PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate tenant lease agreement PDF
router.get('/:id/lease-pdf', async (req: any, res) => {
  try {
    const tenantId = req.params.id;
    
    // Validate tenant ID format
    if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
    }

    const tenant = await Tenant.findById(tenantId)
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Lease_Agreement_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    // Generate PDF and pipe to response
    generateTenantLeaseAgreement(tenant, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Tenant lease PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate tenant lease PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate complete tenant data package
router.get('/:id/complete-package', async (req: any, res) => {
  try {
    const tenantId = req.params.id;
    
    // Validate tenant ID format
    if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
    }

    const tenant = await Tenant.findById(tenantId)
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Get payment history for this tenant
    const payments = await Payment.find({ 
      tenantId: tenantId, 
      organizationId: req.user.organizationId 
    })
    .sort({ paymentDate: -1 })
    .lean();

    const tenantData = {
      ...tenant,
      payments
    };

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Complete_Tenant_Package_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    // Generate comprehensive PDF and pipe to response
    await generateComprehensiveTenantPdf(tenantData, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Tenant package generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate tenant package',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate personal details PDF
router.get('/:id/personal-details-pdf', async (req: any, res) => {
  try {
    const tenantId = req.params.id;
    
    // Validate tenant ID format
    if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
    }

    const tenant = await Tenant.findById(tenantId)
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Personal_Details_${(tenant.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Handle response errors
    res.on('error', (error) => {
      console.error('Response stream error:', error);
    });
    
    // Generate personal details PDF and pipe to response
    generatePersonalDetailsPdf(tenant, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Personal details PDF generation error:', error);
    
    // Check if response has already been sent
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate personal details PDF',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

export default router;