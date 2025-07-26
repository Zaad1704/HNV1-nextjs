import { Request, Response } from 'express';
import User from '../models/User';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
}

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const users = await User.find({ 
      organizationId: req.user.organizationId 
    })
    .select('-password -twoFactorSecret -emailVerificationToken -passwordResetToken')
    .populate('managedProperties', 'name address')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, status, managedProperties } = req.body;

    // Only landlords can update users
    if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can update users'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user belongs to same organization
    if (user.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (status) user.status = status;
    
    // Update managed properties for agents
    if (role === 'Agent' && managedProperties) {
      // Verify all properties belong to the organization
      const properties = await Property.find({
        _id: { $in: managedProperties },
        organizationId: req.user.organizationId
      });
      
      if (properties.length !== managedProperties.length) {
        return res.status(400).json({
          success: false,
          message: 'Some properties do not belong to your organization'
        });
      }
      
      user.managedProperties = managedProperties;
    } else if (role !== 'Agent') {
      user.managedProperties = [];
    }

    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(id)
      .select('-password -twoFactorSecret -emailVerificationToken -passwordResetToken')
      .populate('managedProperties', 'name address');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Only landlords can delete users
    if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can delete users'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user belongs to same organization
    if (user.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }

    // Cannot delete yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};