"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Property_1 = __importDefault(require("../models/Property"));
const getUsers = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const users = await User_1.default.find({
            organizationId: req.user.organizationId
        })
            .select('-password -twoFactorSecret -emailVerificationToken -passwordResetToken')
            .populate('managedProperties', 'name address')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, status, managedProperties } = req.body;
        if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only landlords can update users'
            });
        }
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this user'
            });
        }
        if (name)
            user.name = name;
        if (role)
            user.role = role;
        if (status)
            user.status = status;
        if (role === 'Agent' && managedProperties) {
            const properties = await Property_1.default.find({
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
        }
        else if (role !== 'Agent') {
            user.managedProperties = [];
        }
        await user.save();
        const updatedUser = await User_1.default.findById(id)
            .select('-password -twoFactorSecret -emailVerificationToken -passwordResetToken')
            .populate('managedProperties', 'name address');
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only landlords can delete users'
            });
        }
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this user'
            });
        }
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
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};
exports.deleteUser = deleteUser;
