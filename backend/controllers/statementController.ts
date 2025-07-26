import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import { generateColorfulTenantStatement, generateEnhancedThermalStatement } from '../utils/statementGenerator';

interface AuthRequest extends Request {
  user?: any;
}

export const generateTenantStatement = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { tenantId } = req.params;
    const { format = 'standard', startDate, endDate } = req.query;
    const language = req.user?.language || 'en';

    const tenant = await Tenant.findById(tenantId)
      .populate('propertyId', 'name address image')
      .populate('organizationId', 'name')
      .lean();

    if (!tenant || (tenant.organizationId as any)._id.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const dateFilter: any = { tenantId, organizationId: req.user.organizationId };
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate as string);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate as string);
    }

    const payments = await Payment.find(dateFilter).sort({ paymentDate: -1 }).lean();

    // Generate PDF statement
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="statement-${tenant.name}-${Date.now()}.pdf"`);
      return generateColorfulTenantStatement({
        tenant,
        payments,
        startDate,
        endDate
      }, res, language);
    }
    
    // Generate thermal statement
    if (format === 'thermal') {
      const thermalStatement = generateEnhancedThermalStatement({
        tenant,
        payments,
        startDate,
        endDate
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="statement-${tenant.name}-${Date.now()}.txt"`);
      return res.send(thermalStatement);
    }

    // Standard JSON response
    res.status(200).json({
      success: true,
      data: {
        tenant,
        payments,
        summary: {
          totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
          totalPayments: payments.length
        }
      }
    });
  } catch (error) {
    console.error('Statement generation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};