import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
}

export const getTenantDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'Tenant') {
      return res.status(403).json({ success: false, message: 'Tenant access only' });
    }

    // Find tenant record for this user
    let tenant;
    if (req.user.tenantId) {
      tenant = await Tenant.findById(req.user.tenantId).populate('propertyId', 'name address');
    } else {
      tenant = await Tenant.findOne({ 
        email: req.user.email,
        organizationId: req.user.organizationId 
      }).populate('propertyId', 'name address');
    }

    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tenant record not found' 
      });
    }

    // Get recent payments
    const payments = await Payment.find({
      tenantId: tenant._id,
      organizationId: req.user.organizationId
    }).sort({ paymentDate: -1 }).limit(5);

    // Get maintenance requests
    const maintenanceRequests = await MaintenanceRequest.find({
      tenantId: tenant._id,
      organizationId: req.user.organizationId
    }).sort({ createdAt: -1 }).limit(5);

    const dashboardData = {
      tenant: {
        name: tenant.name,
        unit: tenant.unit,
        rentAmount: tenant.rentAmount,
        status: tenant.status,
        leaseEndDate: tenant.leaseEndDate
      },
      property: tenant.propertyId,
      payments: payments.map(p => ({
        _id: p._id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        status: p.status,
        description: p.description
      })),
      maintenanceRequests: maintenanceRequests.map(m => ({
        _id: m._id,
        description: m.description,
        status: m.status,
        priority: m.priority,
        createdAt: m.createdAt
      }))
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Tenant dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'Tenant') {
      return res.status(403).json({ success: false, message: 'Tenant access only' });
    }

    const { description, priority, category } = req.body;

    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description is required' 
      });
    }

    // Find tenant record
    let tenant;
    if (req.user.tenantId) {
      tenant = await Tenant.findById(req.user.tenantId);
    } else {
      tenant = await Tenant.findOne({ 
        email: req.user.email,
        organizationId: req.user.organizationId 
      });
    }

    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tenant record not found' 
      });
    }

    const maintenanceRequest = await MaintenanceRequest.create({
      organizationId: req.user.organizationId,
      propertyId: tenant.propertyId,
      tenantId: tenant._id,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      status: 'pending',
      requestedBy: req.user._id
    });

    res.status(201).json({ 
      success: true, 
      data: maintenanceRequest 
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};