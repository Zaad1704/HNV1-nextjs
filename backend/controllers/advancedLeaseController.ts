import { Request, Response } from 'express';
import Lease from '../models/Lease';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import Unit from '../models/Unit';
import { IUser } from '../models/User';

// Get expiring leases
export const getExpiringLeases = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(days));

    const leases = await Lease.find({
      organizationId: (req.user as IUser)?.organizationId,
      status: 'active',
      endDate: { $lte: expiryDate }
    })
    .populate('tenantId', 'name email unit')
    .populate('propertyId', 'name address')
    .populate('unitId', 'unitNumber nickname')
    .sort({ endDate: 1 });

    res.json({ success: true, data: leases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expiring leases' });
  }
};

// Auto-renew eligible leases
export const processAutoRenewals = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const leases = await Lease.find({
      organizationId: (req.user as IUser)?.organizationId,
      status: 'active',
      'autoRenewal.enabled': true,
      endDate: { $lte: today }
    });

    const renewedLeases = [];
    
    for (const lease of leases) {
      const newEndDate = new Date(lease.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + lease.autoRenewal.renewalPeriod);
      
      let newRent = lease.rentAmount;
      if (lease.autoRenewal.rentIncrease) {
        if (lease.autoRenewal.rentIncrease.type === 'percentage') {
          newRent = lease.rentAmount * (1 + lease.autoRenewal.rentIncrease.value / 100);
        } else {
          newRent = lease.rentAmount + lease.autoRenewal.rentIncrease.value;
        }
      }

      lease.renewalHistory.push({
        renewedAt: new Date(),
        previousEndDate: lease.endDate,
        newEndDate,
        oldRent: lease.rentAmount,
        newRent,
        renewalType: 'auto'
      });

      lease.endDate = newEndDate;
      lease.rentAmount = newRent;
      lease.status = 'renewed';

      await lease.save();
      renewedLeases.push(lease);
    }

    res.json({ 
      success: true, 
      data: renewedLeases,
      message: `${renewedLeases.length} leases auto-renewed successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process auto-renewals' });
  }
};

// Bulk lease renewal
export const bulkRenewLeases = async (req: Request, res: Response) => {
  try {
    const { leaseIds, renewalPeriod, rentIncrease } = req.body;
    
    const renewedLeases = [];
    
    for (const leaseId of leaseIds) {
      const lease = await Lease.findOne({
        _id: leaseId,
        organizationId: (req.user as IUser)?.organizationId
      });

      if (!lease) continue;

      const newEndDate = new Date(lease.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + renewalPeriod);
      
      let newRent = lease.rentAmount;
      if (rentIncrease) {
        if (rentIncrease.type === 'percentage') {
          newRent = lease.rentAmount * (1 + rentIncrease.value / 100);
        } else {
          newRent = lease.rentAmount + rentIncrease.value;
        }
      }

      lease.renewalHistory.push({
        renewedAt: new Date(),
        previousEndDate: lease.endDate,
        newEndDate,
        oldRent: lease.rentAmount,
        newRent,
        renewalType: 'manual'
      });

      lease.endDate = newEndDate;
      lease.rentAmount = newRent;
      lease.status = 'renewed';

      await lease.save();
      renewedLeases.push(lease);
    }

    res.json({ 
      success: true, 
      data: renewedLeases,
      message: `${renewedLeases.length} leases renewed successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk renew leases' });
  }
};

// Bulk lease termination
export const bulkTerminateLeases = async (req: Request, res: Response) => {
  try {
    const { leaseIds, terminationDate, reason } = req.body;
    
    const terminatedLeases = [];
    
    for (const leaseId of leaseIds) {
      const lease = await Lease.findOne({
        _id: leaseId,
        organizationId: (req.user as IUser)?.organizationId
      });

      if (!lease) continue;

      lease.status = 'terminated';
      lease.endDate = new Date(terminationDate);
      
      // Update tenant status
      await Tenant.findByIdAndUpdate(lease.tenantId, { 
        status: 'Inactive',
        leaseEndDate: new Date(terminationDate)
      });

      await lease.save();
      terminatedLeases.push(lease);
    }

    res.json({ 
      success: true, 
      data: terminatedLeases,
      message: `${terminatedLeases.length} leases terminated successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk terminate leases' });
  }
};

// Generate lease document
export const generateLeaseDocument = async (req: Request, res: Response) => {
  try {
    const { leaseId, templateType = 'standard' } = req.body;
    
    const lease = await Lease.findOne({
      _id: leaseId,
      organizationId: (req.user as IUser)?.organizationId
    })
    .populate('tenantId')
    .populate('propertyId')
    .populate('unitId');

    if (!lease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    // Generate document (simplified - would use PDF generation library)
    const documentData = {
      leaseId: lease._id,
      tenant: lease.tenantId,
      property: lease.propertyId,
      unit: lease.unitId,
      terms: lease.terms,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmount: lease.rentAmount,
      generatedAt: new Date()
    };

    // Add to lease documents
    lease.documents.push({
      type: 'lease_agreement',
      url: `/documents/lease_${lease._id}_${Date.now()}.pdf`,
      filename: `Lease_Agreement_${(lease.tenantId as any).name}.pdf`,
      generatedAt: new Date(),
      templateUsed: templateType
    });

    await lease.save();

    res.json({ 
      success: true, 
      data: documentData,
      message: 'Lease document generated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate lease document' });
  }
};

// Update lease auto-renewal settings
export const updateAutoRenewalSettings = async (req: Request, res: Response) => {
  try {
    const { leaseId } = req.params;
    const { autoRenewal } = req.body;

    const lease = await Lease.findOneAndUpdate(
      { _id: leaseId, organizationId: (req.user as IUser)?.organizationId },
      { autoRenewal },
      { new: true }
    );

    if (!lease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    res.json({ success: true, data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update auto-renewal settings' });
  }
};

// Get lease analytics
export const getLeaseAnalytics = async (req: Request, res: Response) => {
  try {
    const organizationId = (req.user as IUser)?.organizationId;
    
    const [
      totalLeases,
      activeLeases,
      expiringLeases,
      autoRenewalLeases,
      avgRentAmount
    ] = await Promise.all([
      Lease.countDocuments({ organizationId }),
      Lease.countDocuments({ organizationId, status: 'active' }),
      Lease.countDocuments({ 
        organizationId, 
        status: 'active',
        endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }),
      Lease.countDocuments({ organizationId, 'autoRenewal.enabled': true }),
      Lease.aggregate([
        { $match: { organizationId, status: 'active' } },
        { $group: { _id: null, avgRent: { $avg: '$rentAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalLeases,
        activeLeases,
        expiringLeases,
        autoRenewalLeases,
        avgRentAmount: avgRentAmount[0]?.avgRent || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch lease analytics' });
  }
};