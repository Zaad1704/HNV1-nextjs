import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import AuditLog from '../models/AuditLog';

interface AuthRequest extends Request {
  user?: any;
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldData = { name: user.name, email: user.email, phone: user.phone };

    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    // Email change requires re-verification
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
      user.email = email;
      user.isEmailVerified = false;
      user.status = 'Pending';
    }

    await user.save();

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      action: 'profile_updated',
      resource: 'user_profile',
      resourceId: req.user._id,
      details: { oldData, newData: { name, email, phone } },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerificationRequired: email && email !== oldData.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { name, companyName, companyAddress } = req.body;
    const organization = await Organization.findById(req.user.organizationId);

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Only owner can update organization
    if (organization.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only organization owner can update settings' 
      });
    }

    if (name) organization.name = name;
    if (companyName) organization.branding.companyName = companyName;
    if (companyAddress) organization.branding.companyAddress = companyAddress;

    await organization.save();

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const requestAccountDeletion = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    // Only landlords can delete accounts
    if (req.user.role !== 'Landlord') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only landlords can request account deletion' 
      });
    }

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    organization.dataManagement.accountDeletionRequestedAt = new Date();
    await organization.save();

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      action: 'account_deletion_requested',
      resource: 'organization',
      resourceId: req.user.organizationId,
      details: { reason },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Account deletion requested. You will receive an email with data export within 24 hours.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Only landlords can export data
    if (req.user.role !== 'Landlord') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only landlords can export organization data' 
      });
    }

    const organization = await Organization.findById(req.user.organizationId);
    organization.dataManagement.dataExportRequestedAt = new Date();
    await organization.save();

    res.json({
      success: true,
      message: 'Data export requested. You will receive a download link via email within 24 hours.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};