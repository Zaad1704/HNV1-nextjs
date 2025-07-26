import { Request, Response } from 'express';
import Organization from '../models/Organization';

interface AuthRequest extends Request {
  user?: any;
}

export const getMyOrganization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const organization = await Organization.findById(req.user.organizationId)
      .populate('owner', 'name email')
      .populate('subscription.planId', 'name price features');

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.status(200).json({ success: true, data: organization });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const organizations = await Organization.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: organizations || [] });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch organizations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const organization = await Organization.findByIdAndUpdate(
      req.user.organizationId,
      req.body,
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.status(200).json({ success: true, data: organization });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const setOrgStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orgId, status } = req.body;

    if (!orgId || !status) {
      return res.status(400).json({ success: false, message: 'Organization ID and status are required' });
    }

    const organization = await Organization.findByIdAndUpdate(
      orgId,
      { status },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Organization ${organization.name} status updated to ${organization.status}`,
      data: organization
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};