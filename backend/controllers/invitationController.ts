import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import crypto from 'crypto';

interface AuthRequest extends Request {
  user?: any;
}

export const inviteTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { email, role, name } = req.body;

    if (!email || !role || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, role, and name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Generate invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(inviteToken).digest('hex');

    // Create user with pending status
    const user = await User.create({
      name,
      email,
      role,
      organizationId: req.user.organizationId,
      status: 'pending',
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Add to organization members
    await Organization.findByIdAndUpdate(
      req.user.organizationId,
      { $addToSet: { members: user._id } }
    );

    // Send invitation email
    try {
      const messagingService = (await import('../services/messagingService')).default;
      const inviteLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${inviteToken}`;
      const organization = await Organization.findById(req.user.organizationId);
      
      await messagingService.sendInvitation(
        email,
        req.user.name,
        organization?.name || 'Organization',
        role,
        inviteLink
      );
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: { email, role, name }
    });
  } catch (error) {
    console.error('Invite team member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOrganizationCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Generate organization code if not exists
    let orgCode = organization.inviteCode;
    if (!orgCode) {
      orgCode = req.user.organizationId.toString().substring(0, 8).toUpperCase();
      organization.inviteCode = orgCode;
      await organization.save();
    }

    res.json({
      success: true,
      data: {
        code: orgCode,
        organizationName: organization.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const joinWithCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, email, password } = req.body;

    if (!code || !name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Find organization by code
    const organization = await Organization.findOne({ inviteCode: code });
    if (!organization) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid organization code' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'Agent', // Default role for code joiners
      organizationId: organization._id,
      status: 'active',
      isEmailVerified: true // Auto-verify for code joiners
    });

    // Add to organization members
    await Organization.findByIdAndUpdate(
      organization._id,
      { $addToSet: { members: user._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Successfully joined organization',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        organization: {
          name: organization.name
        }
      }
    });
  } catch (error) {
    console.error('Join with code error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};