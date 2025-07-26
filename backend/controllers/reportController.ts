import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';
import Receipt from '../models/Receipt';
import MaintenanceRequest from '../models/MaintenanceRequest';

interface AuthRequest extends Request {
  user?: any;
}

// Financial summary report
export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user?.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [payments, invoices, maintenance] = await Promise.all([
      Payment.find({ organizationId: user.organizationId, paymentDate: { $gte: start, $lte: end } }).lean(),
      Invoice.find({ organizationId: user.organizationId, issueDate: { $gte: start, $lte: end } }).lean(),
      MaintenanceRequest.find({ organizationId: user.organizationId, createdAt: { $gte: start, $lte: end } }).lean()
    ]);

    const totalIncome = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const maintenanceCosts = maintenance.reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        income: { total: totalIncome, invoiced: totalInvoiced, collected: totalIncome },
        expenses: { maintenance: maintenanceCosts },
        netIncome: totalIncome - maintenanceCosts
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Property performance report
export const getPropertyPerformance = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user?.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const properties = await Property.find({ organizationId: user.organizationId }).lean();
    const performance = await Promise.all(properties.map(async (property) => {
      const [tenants, payments, maintenance] = await Promise.all([
        Tenant.find({ propertyId: property._id }).lean(),
        Payment.find({ propertyId: property._id, status: 'Paid' }).lean(),
        MaintenanceRequest.find({ propertyId: property._id }).lean()
      ]);

      const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
      const maintenanceCosts = maintenance.reduce((sum, m) => sum + (m.actualCost || 0), 0);
      const occupancyRate = property.totalUnits > 0 ? (tenants.length / property.totalUnits) * 100 : 0;

      return {
        propertyId: property._id,
        propertyName: property.name,
        totalUnits: property.totalUnits,
        occupiedUnits: tenants.length,
        occupancyRate: Math.round(occupancyRate),
        totalIncome,
        maintenanceCosts,
        netIncome: totalIncome - maintenanceCosts
      };
    }));

    res.status(200).json({ success: true, data: performance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Tenant report
export const getTenantReport = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user?.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const tenants = await Tenant.find({ organizationId: user.organizationId })
      .populate('propertyId', 'name')
      .lean();

    const tenantData = await Promise.all(tenants.map(async (tenant) => {
      const [payments, invoices] = await Promise.all([
        Payment.find({ tenantId: tenant._id }).lean(),
        Invoice.find({ tenantId: tenant._id }).lean()
      ]);

      const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
      const totalOwed = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.totalAmount, 0);
      const lastPayment = payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];

      return {
        tenantId: tenant._id,
        name: tenant.name,
        email: tenant.email,
        property: (tenant.propertyId as any)?.name,
        unit: tenant.unit,
        rentAmount: tenant.rentAmount,
        totalPaid,
        totalOwed,
        lastPaymentDate: lastPayment?.paymentDate,
        status: totalOwed > 0 ? 'Outstanding' : 'Current'
      };
    }));

    res.status(200).json({ success: true, data: tenantData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Maintenance report
export const getMaintenanceReport = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user?.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const requests = await MaintenanceRequest.find({
      organizationId: user.organizationId,
      createdAt: { $gte: start, $lte: end }
    })
    .populate('propertyId', 'name')
    .populate('tenantId', 'name')
    .lean();

    const summary = {
      totalRequests: requests.length,
      completed: requests.filter(r => r.status === 'Completed').length,
      pending: requests.filter(r => r.status !== 'Completed').length,
      totalCost: requests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0),
      avgCost: requests.length > 0 ? requests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0) / requests.length : 0,
      byCategory: requests.reduce((acc: any, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json({ success: true, data: { summary, requests } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCollectionSheet = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user?.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { month, year, propertyId } = req.query;
    
    if (!month || !year) {
      res.status(400).json({ success: false, message: 'Month and year are required' });
      return;
    }

    let tenantQuery: any = { organizationId: user.organizationId, status: { $ne: 'Archived' } };
    if (propertyId) tenantQuery.propertyId = propertyId;

    const tenants = await Tenant.find(tenantQuery).populate('propertyId', 'name').lean();
    
    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);

    const payments = await Payment.find({
      organizationId: user.organizationId,
      paymentDate: { $gte: startDate, $lte: endDate },
      status: 'Paid'
    }).lean();

    const collectionData = tenants.map((tenant: any) => {
      const tenantPayments = payments.filter((p: any) => 
        p.tenantId?.toString() === tenant._id.toString()
      );
      
      const paidAmount = tenantPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const latestPayment = tenantPayments.sort((a: any, b: any) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];

      return {
        tenantId: tenant._id,
        tenantName: tenant.name,
        propertyId: tenant.propertyId?._id,
        propertyName: tenant.propertyId?.name || 'N/A',
        unit: tenant.unit,
        rentAmount: tenant.rentAmount || 0,
        paidAmount,
        paymentDate: latestPayment?.paymentDate || null,
        paymentMethod: latestPayment?.paymentMethod || null,
        status: paidAmount >= (tenant.rentAmount || 0) ? 'Paid' : 'Pending'
      };
    });

    const summary = {
      totalTenants: collectionData.length,
      paidTenants: collectionData.filter(t => t.status === 'Paid').length,
      totalExpected: collectionData.reduce((sum, t) => sum + t.rentAmount, 0),
      totalCollected: collectionData.reduce((sum, t) => sum + t.paidAmount, 0)
    };

    res.status(200).json({ success: true, data: collectionData, summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};