"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBilling = exports.updateSubscription = exports.updateUserSubscription = exports.activatePlan = exports.uploadImage = exports.updateSiteContent = exports.updateSiteSettings = exports.getModeratorPermissions = exports.deleteModerator = exports.updateModerator = exports.createModerator = exports.getModerators = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlans = exports.updateUserPlan = exports.deleteUser = exports.updateUserStatus = exports.getUsers = exports.revokeLifetime = exports.grantLifetime = exports.deactivateOrganization = exports.activateOrganization = exports.deleteOrganization = exports.getOrganizations = exports.getEmailStatus = exports.getPlatformGrowth = exports.getPlanDistribution = exports.getDashboardStats = void 0;
const Organization_1 = __importDefault(require("../models/Organization"));
const Plan_1 = __importDefault(require("../models/Plan"));
const User_1 = __importDefault(require("../models/User"));
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
const Notification_1 = __importDefault(require("../models/Notification"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const superAdminActionService_1 = __importDefault(require("../services/superAdminActionService"));
const getDashboardStats = async (req, res) => {
    try {
        const [totalOrgs, totalUsers, activeOrgs, inactiveOrgs] = await Promise.all([
            Organization_1.default.countDocuments(),
            User_1.default.countDocuments(),
            Organization_1.default.countDocuments({ status: 'active' }),
            Organization_1.default.countDocuments({ status: 'inactive' })
        ]);
        res.json({
            success: true,
            data: {
                totalOrganizations: totalOrgs,
                totalUsers: totalUsers,
                totalOrgs: totalOrgs,
                activeOrganizations: activeOrgs,
                inactiveOrganizations: inactiveOrgs,
                activeSubscriptions: activeOrgs,
                revenue: activeOrgs * 99,
                conversionRate: totalOrgs > 0 ? ((activeOrgs / totalOrgs) * 100).toFixed(1) : 0
            }
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.json({ success: true, data: { totalOrganizations: 0, totalUsers: 0, totalOrgs: 0, activeOrganizations: 0, inactiveOrganizations: 0, activeSubscriptions: 0, revenue: 0, conversionRate: 0 } });
    }
};
exports.getDashboardStats = getDashboardStats;
const getPlanDistribution = async (req, res) => {
    try {
        const plans = await Plan_1.default.find();
        const orgs = await Organization_1.default.find().populate('subscription.planId');
        const distribution = plans.map(plan => {
            const count = orgs.filter(org => {
                const planId = org.subscription?.planId;
                return planId && planId.toString() === plan._id.toString();
            }).length;
            return {
                name: plan.name,
                value: count
            };
        });
        res.json({ success: true, data: distribution });
    }
    catch (error) {
        res.json({ success: true, data: [] });
    }
};
exports.getPlanDistribution = getPlanDistribution;
const getPlatformGrowth = async (req, res) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const currentDate = new Date();
        const data = await Promise.all(months.map(async (month, index) => {
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index) + 1, 0);
            const orgs = await Organization_1.default.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            const users = await User_1.default.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            return {
                month,
                organizations: orgs,
                users: users
            };
        }));
        res.json({ success: true, data });
    }
    catch (error) {
        res.json({ success: true, data: [] });
    }
};
exports.getPlatformGrowth = getPlatformGrowth;
const getEmailStatus = async (req, res) => {
    try {
        const totalNotifications = await Notification_1.default.countDocuments();
        const readNotifications = await Notification_1.default.countDocuments({ isRead: true });
        res.json({
            success: true,
            data: {
                sent: totalNotifications,
                delivered: Math.floor(totalNotifications * 0.95),
                opened: readNotifications,
                clicked: Math.floor(readNotifications * 0.3),
                configured: process.env.EMAIL_SERVICE_CONFIGURED === 'true'
            }
        });
    }
    catch (error) {
        res.json({
            success: true,
            data: {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                configured: false
            }
        });
    }
};
exports.getEmailStatus = getEmailStatus;
const getOrganizations = async (req, res) => {
    try {
        const orgs = await Organization_1.default.find()
            .populate('owner', 'name email role')
            .populate('members', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);
        const orgsWithSubscriptions = await Promise.all(orgs.map(async (org) => {
            const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
            const subscription = await Subscription.findOne({
                organizationId: org._id
            }).populate('planId', 'name price duration');
            return {
                ...org.toObject(),
                subscription: subscription ? {
                    status: subscription.status,
                    planId: subscription.planId,
                    isLifetime: subscription.isLifetime,
                    trialExpiresAt: subscription.trialExpiresAt,
                    currentPeriodEndsAt: subscription.currentPeriodEndsAt
                } : null
            };
        }));
        res.json({ success: true, data: orgsWithSubscriptions });
    }
    catch (error) {
        console.error('Get organizations error:', error);
        res.json({ success: true, data: [] });
    }
};
exports.getOrganizations = getOrganizations;
const deleteOrganization = async (req, res) => {
    try {
        const org = await Organization_1.default.findById(req.params.orgId);
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        const orgId = org._id;
        const orgName = org.name;
        const [Property, Tenant, Payment, Expense, MaintenanceRequest, Subscription] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Property'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/Tenant'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/Payment'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))).then(m => m.default),
            Promise.resolve().then(() => __importStar(require('../models/Subscription'))).then(m => m.default)
        ]);
        await Promise.all([
            Property.deleteMany({ organizationId: orgId }),
            Tenant.deleteMany({ organizationId: orgId }),
            Payment.deleteMany({ organizationId: orgId }),
            Expense.deleteMany({ organizationId: orgId }),
            MaintenanceRequest.deleteMany({ organizationId: orgId }),
            Subscription.deleteMany({ organizationId: orgId }),
            User_1.default.deleteMany({ organizationId: orgId, role: { $ne: 'Super Admin' } })
        ]);
        try {
            await AuditLog_1.default.create({
                userId: req.user._id,
                organizationId: orgId,
                action: 'organization_deleted',
                resource: 'organization',
                resourceId: orgId,
                details: { organizationName: orgName, deletedBy: 'Super Admin' },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log failed:', auditError);
        }
        await Organization_1.default.findByIdAndDelete(orgId);
        res.json({ success: true, message: 'Organization deleted successfully', data: { deletedOrgId: orgId } });
    }
    catch (error) {
        console.error('Delete organization error:', error);
        res.status(500).json({ success: false, message: 'Error deleting organization' });
    }
};
exports.deleteOrganization = deleteOrganization;
const activateOrganization = async (req, res) => {
    try {
        const org = await Organization_1.default.findByIdAndUpdate(req.params.orgId, { status: 'active' }, { new: true }).populate('owner');
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
        await Subscription.findOneAndUpdate({ organizationId: org._id }, { status: 'active' });
        await User_1.default.updateMany({ organizationId: org._id, role: { $ne: 'Super Admin' } }, { status: 'Active' });
        try {
            await AuditLog_1.default.create({
                userId: req.user._id,
                organizationId: org._id,
                action: 'organization_activated',
                resource: 'organization',
                resourceId: org._id,
                details: { organizationName: org.name, activatedBy: 'Super Admin' },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log failed:', auditError);
        }
        res.json({ success: true, data: org, message: 'Organization activated successfully' });
    }
    catch (error) {
        console.error('Activate organization error:', error);
        res.status(500).json({ success: false, message: 'Error activating organization' });
    }
};
exports.activateOrganization = activateOrganization;
const deactivateOrganization = async (req, res) => {
    try {
        const org = await Organization_1.default.findByIdAndUpdate(req.params.orgId, { status: 'inactive' }, { new: true }).populate('owner');
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
        await Subscription.findOneAndUpdate({ organizationId: org._id }, { status: 'inactive' });
        await User_1.default.updateMany({ organizationId: org._id, role: { $ne: 'Super Admin' } }, { status: 'Suspended' });
        try {
            await AuditLog_1.default.create({
                userId: req.user._id,
                organizationId: org._id,
                action: 'organization_deactivated',
                resource: 'organization',
                resourceId: org._id,
                details: { organizationName: org.name, deactivatedBy: 'Super Admin' },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log failed:', auditError);
        }
        res.json({ success: true, data: org, message: 'Organization deactivated successfully' });
    }
    catch (error) {
        console.error('Deactivate organization error:', error);
        res.status(500).json({ success: false, message: 'Error deactivating organization' });
    }
};
exports.deactivateOrganization = deactivateOrganization;
const grantLifetime = async (req, res) => {
    try {
        const org = await Organization_1.default.findById(req.params.orgId).populate('owner');
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
        const subscription = await Subscription.findOneAndUpdate({ organizationId: org._id }, {
            isLifetime: true,
            status: 'active',
            currentPeriodEndsAt: null,
            nextBillingDate: null
        }, { new: true, upsert: true });
        org.status = 'Active';
        await org.save();
        try {
            await AuditLog_1.default.create({
                userId: req.user._id,
                organizationId: org._id,
                action: 'lifetime_access_granted',
                resource: 'subscription',
                resourceId: subscription._id,
                details: { organizationName: org.name, grantedBy: 'Super Admin' },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log failed:', auditError);
        }
        res.json({ success: true, data: org, message: 'Lifetime access granted successfully' });
    }
    catch (error) {
        console.error('Grant lifetime error:', error);
        res.status(500).json({ success: false, message: 'Error granting lifetime access' });
    }
};
exports.grantLifetime = grantLifetime;
const revokeLifetime = async (req, res) => {
    try {
        const org = await Organization_1.default.findById(req.params.orgId);
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
        const subscription = await Subscription.findOneAndUpdate({ organizationId: org._id }, {
            isLifetime: false,
            currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }, { new: true });
        res.json({ success: true, data: org, message: 'Lifetime access revoked successfully' });
    }
    catch (error) {
        console.error('Revoke lifetime error:', error);
        res.status(500).json({ success: false, message: 'Error revoking lifetime access' });
    }
};
exports.revokeLifetime = revokeLifetime;
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find()
            .populate('organizationId', 'name status')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(200);
        const usersWithSubscriptions = await Promise.all(users.map(async (user) => {
            let subscription = null;
            if (user.organizationId) {
                const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
                subscription = await Subscription.findOne({
                    organizationId: user.organizationId
                }).populate('planId', 'name price duration');
            }
            return {
                ...user.toObject(),
                subscription: subscription ? {
                    status: subscription.status,
                    planId: subscription.planId,
                    isLifetime: subscription.isLifetime,
                    trialExpiresAt: subscription.trialExpiresAt
                } : null
            };
        }));
        res.json({ success: true, data: usersWithSubscriptions });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.json({ success: true, data: [] });
    }
};
exports.getUsers = getUsers;
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.params.userId;
        const user = await User_1.default.findByIdAndUpdate(userId, { status }, { new: true }).select('-password -twoFactorSecret');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user, message: 'User status updated successfully' });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ success: false, message: 'Error updating user status' });
    }
};
exports.updateUserStatus = updateUserStatus;
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'Super Admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete Super Admin users' });
        }
        try {
            await AuditLog_1.default.create({
                userId: req.user._id,
                organizationId: user.organizationId,
                action: 'user_deleted',
                resource: 'user',
                resourceId: user._id,
                details: {
                    userName: user.name,
                    userEmail: user.email,
                    userRole: user.role,
                    deletedBy: 'Super Admin'
                },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log creation failed:', auditError);
        }
        try {
            await superAdminActionService_1.default.onUserDeleted(userId, user, req.user._id);
        }
        catch (actionError) {
            console.error('Action chain failed:', actionError);
        }
        await User_1.default.findByIdAndDelete(userId);
        console.log(`User ${user.email} deleted by Super Admin ${req.user.email}`);
        res.json({
            success: true,
            message: `User ${user.name} deleted successfully`,
            data: { deletedUserId: userId }
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.deleteUser = deleteUser;
const updateUserPlan = async (req, res) => {
    try {
        const { planId } = req.body;
        await User_1.default.findByIdAndUpdate(req.params.userId, { planId });
        res.json({ success: true, data: {} });
    }
    catch (error) {
        res.json({ success: false, message: 'Error updating user plan' });
    }
};
exports.updateUserPlan = updateUserPlan;
const getPlans = async (req, res) => {
    try {
        const plans = await Plan_1.default.find();
        res.json({ success: true, data: plans });
    }
    catch (error) {
        res.json({ success: true, data: [] });
    }
};
exports.getPlans = getPlans;
const createPlan = async (req, res) => {
    try {
        const plan = await Plan_1.default.create(req.body);
        await AuditLog_1.default.create({
            userId: req.user._id,
            organizationId: null,
            action: 'plan_created',
            resource: 'plan',
            resourceId: plan._id,
            details: { planName: plan.name, price: plan.price, createdBy: 'Super Admin' },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        });
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.json({ success: false, message: 'Error creating plan' });
    }
};
exports.createPlan = createPlan;
const updatePlan = async (req, res) => {
    try {
        const oldPlan = await Plan_1.default.findById(req.params.id);
        const plan = await Plan_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (plan && oldPlan) {
            await superAdminActionService_1.default.onPlanUpdated(plan._id, oldPlan, plan, req.user._id);
            await AuditLog_1.default.create({
                userId: req.user._id,
                organizationId: null,
                action: 'plan_updated',
                resource: 'plan',
                resourceId: plan._id,
                details: {
                    planName: plan.name,
                    oldPrice: oldPlan?.price,
                    newPrice: plan.price,
                    updatedBy: 'Super Admin'
                },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.json({ success: false, message: 'Error updating plan' });
    }
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res) => {
    try {
        await Plan_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    }
    catch (error) {
        res.json({ success: false, message: 'Error deleting plan' });
    }
};
exports.deletePlan = deletePlan;
const getModerators = async (req, res) => {
    try {
        const moderators = await User_1.default.find({
            role: { $in: ['Super Moderator', 'Moderator'] }
        }).select('-password -twoFactorSecret');
        res.json({ success: true, data: moderators });
    }
    catch (error) {
        console.error('Get moderators error:', error);
        res.json({ success: true, data: [] });
    }
};
exports.getModerators = getModerators;
const createModerator = async (req, res) => {
    try {
        const { name, email, password, permissions, accessLevel } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const moderatorData = {
            name,
            email,
            password,
            role: accessLevel === 'super' ? 'Super Moderator' : 'Moderator',
            permissions: permissions || [],
            status: 'Active',
            isEmailVerified: true
        };
        const moderator = await User_1.default.create(moderatorData);
        await AuditLog_1.default.create({
            userId: req.user._id,
            organizationId: null,
            action: 'moderator_created',
            resource: 'user',
            resourceId: moderator._id,
            details: {
                moderatorName: moderator.name,
                moderatorEmail: moderator.email,
                role: moderator.role,
                permissions: moderator.permissions,
                createdBy: 'Super Admin'
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        });
        const { password: _, ...moderatorResponse } = moderator.toObject();
        res.json({ success: true, data: moderatorResponse, message: 'Moderator created successfully' });
    }
    catch (error) {
        console.error('Create moderator error:', error);
        res.status(500).json({ success: false, message: 'Error creating moderator' });
    }
};
exports.createModerator = createModerator;
const updateModerator = async (req, res) => {
    try {
        const { permissions, accessLevel, status } = req.body;
        const moderatorId = req.params.id;
        const updateData = {};
        if (permissions !== undefined)
            updateData.permissions = permissions;
        if (accessLevel) {
            updateData.role = accessLevel === 'super' ? 'Super Moderator' : 'Moderator';
        }
        if (status)
            updateData.status = status;
        const moderator = await User_1.default.findByIdAndUpdate(moderatorId, updateData, { new: true }).select('-password -twoFactorSecret');
        if (!moderator) {
            return res.status(404).json({ success: false, message: 'Moderator not found' });
        }
        await AuditLog_1.default.create({
            userId: req.user._id,
            organizationId: null,
            action: 'moderator_updated',
            resource: 'user',
            resourceId: moderator._id,
            details: {
                moderatorName: moderator.name,
                updatedFields: Object.keys(updateData),
                newRole: moderator.role,
                newPermissions: moderator.permissions,
                updatedBy: 'Super Admin'
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        });
        res.json({ success: true, data: moderator, message: 'Moderator updated successfully' });
    }
    catch (error) {
        console.error('Update moderator error:', error);
        res.status(500).json({ success: false, message: 'Error updating moderator' });
    }
};
exports.updateModerator = updateModerator;
const deleteModerator = async (req, res) => {
    try {
        const moderatorId = req.params.id;
        const moderator = await User_1.default.findById(moderatorId);
        if (!moderator) {
            return res.status(404).json({ success: false, message: 'Moderator not found' });
        }
        if (moderator.role === 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete Super Admin users'
            });
        }
        await AuditLog_1.default.create({
            userId: req.user._id,
            organizationId: null,
            action: 'moderator_deleted',
            resource: 'user',
            resourceId: moderator._id,
            details: {
                moderatorName: moderator.name,
                moderatorEmail: moderator.email,
                role: moderator.role,
                deletedBy: 'Super Admin'
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        });
        await User_1.default.findByIdAndDelete(moderatorId);
        res.json({
            success: true,
            message: 'Moderator deleted successfully',
            data: { deletedModeratorId: moderatorId }
        });
    }
    catch (error) {
        console.error('Delete moderator error:', error);
        res.status(500).json({ success: false, message: 'Error deleting moderator' });
    }
};
exports.deleteModerator = deleteModerator;
const getModeratorPermissions = async (req, res) => {
    try {
        const availablePermissions = [
            { id: 'live_chat', name: 'Live Chat Management', description: 'Manage live chat conversations and responses' },
            { id: 'billing', name: 'Billing Management', description: 'View and manage billing information' },
            { id: 'user_management', name: 'User Management', description: 'Manage user accounts and permissions' },
            { id: 'organization_management', name: 'Organization Management', description: 'Manage organization settings and data' },
            { id: 'content_moderation', name: 'Content Moderation', description: 'Moderate user-generated content' },
            { id: 'analytics', name: 'Analytics Access', description: 'View platform analytics and reports' },
            { id: 'system_settings', name: 'System Settings', description: 'Modify system-wide settings' },
            { id: 'audit_logs', name: 'Audit Log Access', description: 'View system audit logs' }
        ];
        res.json({ success: true, data: availablePermissions });
    }
    catch (error) {
        console.error('Get moderator permissions error:', error);
        res.status(500).json({ success: false, message: 'Error fetching permissions' });
    }
};
exports.getModeratorPermissions = getModeratorPermissions;
const updateSiteSettings = async (req, res) => {
    try {
        const oldSettings = await SiteSettings_1.default.findOne();
        const settings = await SiteSettings_1.default.findOneAndUpdate({}, {
            ...req.body,
            lastUpdated: new Date(),
            updatedBy: req.user._id
        }, { new: true, upsert: true });
        await AuditLog_1.default.create({
            userId: req.user._id,
            organizationId: null,
            action: 'site_settings_updated',
            resource: 'site_settings',
            resourceId: settings._id,
            details: {
                updatedFields: Object.keys(req.body),
                updatedBy: 'Super Admin',
                previousVersion: oldSettings ? oldSettings.toObject() : null
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        });
        console.log('Site settings updated, triggering cache refresh');
        res.json({ success: true, data: settings });
    }
    catch (error) {
        console.error('Site settings update error:', error);
        res.json({ success: false, message: 'Error updating site settings' });
    }
};
exports.updateSiteSettings = updateSiteSettings;
const updateSiteContent = async (req, res) => {
    try {
        const { section } = req.params;
        const settings = await SiteSettings_1.default.findOneAndUpdate({}, { [`content.${section}`]: req.body }, { new: true, upsert: true });
        res.json({ success: true, data: settings });
    }
    catch (error) {
        res.json({ success: false, message: 'Error updating site content' });
    }
};
exports.updateSiteContent = updateSiteContent;
const uploadImage = async (req, res) => {
    try {
        console.log('Upload image request:', { file: !!req.file, body: req.body });
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const imageUrl = req.file.location;
        try {
            await AuditLog_1.default.create({
                userId: req.user?._id,
                organizationId: null,
                action: 'site_image_uploaded',
                resource: 'site_image',
                resourceId: req.file.filename,
                details: {
                    section: req.body.section || 'general',
                    field: req.body.field || 'image',
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    uploadedBy: 'Super Admin'
                },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log creation failed:', auditError);
        }
        res.status(200).json({ success: true, data: { imageUrl } });
    }
    catch (error) {
        console.error('Image upload error:', error);
        res.status(200).json({
            success: false,
            message: 'Error uploading image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.uploadImage = uploadImage;
const activatePlan = async (req, res) => {
    try {
        const plan = await Plan_1.default.findById(req.params.id);
        if (!plan) {
            return res.json({ success: false, message: 'Plan not found' });
        }
        plan.isActive = !plan.isActive;
        await plan.save();
        await AuditLog_1.default.create({
            userId: req.user._id,
            organizationId: null,
            action: plan.isActive ? 'plan_activated' : 'plan_deactivated',
            resource: 'plan',
            resourceId: plan._id,
            details: { planName: plan.name, status: plan.isActive ? 'activated' : 'deactivated' },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        });
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.json({ success: false, message: 'Error updating plan status' });
    }
};
exports.activatePlan = activatePlan;
const updateUserSubscription = async (req, res) => {
    try {
        const { planId, status } = req.body;
        const userId = req.user._id;
        const user = await User_1.default.findById(userId);
        if (!user || !user.organizationId) {
            return res.status(404).json({ success: false, message: 'User or organization not found' });
        }
        const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
        const Plan = (await Promise.resolve().then(() => __importStar(require('../models/Plan')))).default;
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const subscription = await Subscription.findOneAndUpdate({ organizationId: user.organizationId }, {
            planId,
            status: status || 'active',
            amount: plan.price,
            currency: 'USD',
            billingCycle: plan.duration,
            currentPeriodStartsAt: new Date(),
            currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lastPaymentDate: new Date()
        }, { new: true, upsert: true }).populate('planId');
        await Organization_1.default.findByIdAndUpdate(user.organizationId, {
            status: 'active'
        });
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        console.error('Update user subscription error:', error);
        res.status(500).json({ success: false, message: 'Error updating subscription' });
    }
};
exports.updateUserSubscription = updateUserSubscription;
const updateSubscription = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { planId, status, isLifetime, trialExpiresAt, currentPeriodEndsAt, currentPeriodStartsAt, nextBillingDate, cancelAtPeriodEnd, canceledAt, amount, currency, billingCycle, paymentMethod, lastPaymentDate, failedPaymentAttempts, externalId, notes, maxProperties, maxTenants, maxAgents, maxUsers } = req.body;
        const Subscription = (await Promise.resolve().then(() => __importStar(require('../models/Subscription')))).default;
        const Plan = (await Promise.resolve().then(() => __importStar(require('../models/Plan')))).default;
        let subscriptionAmount = amount;
        if (!subscriptionAmount && planId) {
            const plan = await Plan.findById(planId);
            subscriptionAmount = plan?.price || 0;
        }
        const subscription = await Subscription.findOneAndUpdate({ organizationId: orgId }, {
            planId,
            status,
            isLifetime: isLifetime || false,
            trialExpiresAt: trialExpiresAt ? new Date(trialExpiresAt) : undefined,
            currentPeriodEndsAt: currentPeriodEndsAt ? new Date(currentPeriodEndsAt) : undefined,
            currentPeriodStartsAt: currentPeriodStartsAt ? new Date(currentPeriodStartsAt) : new Date(),
            nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : undefined,
            cancelAtPeriodEnd: cancelAtPeriodEnd || false,
            canceledAt: canceledAt ? new Date(canceledAt) : undefined,
            amount: subscriptionAmount || 0,
            currency: currency || 'USD',
            billingCycle: billingCycle || 'monthly',
            paymentMethod: paymentMethod || null,
            lastPaymentDate: lastPaymentDate ? new Date(lastPaymentDate) : (status === 'active' ? new Date() : undefined),
            failedPaymentAttempts: failedPaymentAttempts || 0,
            externalId: externalId || null,
            notes: notes || null,
            maxProperties: maxProperties !== undefined ? maxProperties : -1,
            maxTenants: maxTenants !== undefined ? maxTenants : -1,
            maxAgents: maxAgents !== undefined ? maxAgents : -1,
            maxUsers: maxUsers !== undefined ? maxUsers : -1
        }, { new: true, upsert: true }).populate('planId');
        await Organization_1.default.findByIdAndUpdate(orgId, {
            status: status === 'active' || status === 'trialing' ? 'active' : 'inactive'
        });
        try {
            const Property = (await Promise.resolve().then(() => __importStar(require('../models/Property')))).default;
            const Tenant = (await Promise.resolve().then(() => __importStar(require('../models/Tenant')))).default;
            const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
            const [currentProperties, currentTenants, currentUsers] = await Promise.all([
                Property.countDocuments({ organizationId: orgId }),
                Tenant.countDocuments({ organizationId: orgId }),
                User.countDocuments({ organizationId: orgId, role: { $ne: 'Super Admin' } })
            ]);
            const currentAgents = await User.countDocuments({
                organizationId: orgId,
                role: { $in: ['Agent', 'Manager'] }
            });
            await Subscription.findByIdAndUpdate(subscription._id, {
                currentProperties,
                currentTenants,
                currentAgents,
                currentUsers
            });
            subscription.currentProperties = currentProperties;
            subscription.currentTenants = currentTenants;
            subscription.currentAgents = currentAgents;
            subscription.currentUsers = currentUsers;
        }
        catch (usageError) {
            console.error('Failed to calculate usage:', usageError);
        }
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        console.error('Update subscription error:', error);
        res.json({ success: false, message: 'Error updating subscription' });
    }
};
exports.updateSubscription = updateSubscription;
const getBilling = async (req, res) => {
    try {
        const activeOrgs = await Organization_1.default.countDocuments({ 'subscription.status': 'active' });
        const totalOrgs = await Organization_1.default.countDocuments();
        const orgsWithPlans = await Organization_1.default.find({ 'subscription.planId': { $exists: true } })
            .populate('subscription.planId');
        const totalRevenue = orgsWithPlans.reduce((sum, org) => {
            return sum + (org.subscription?.planId?.price || 0);
        }, 0);
        const monthlyRevenue = Math.floor(totalRevenue / 12);
        const recentTransactions = orgsWithPlans.slice(0, 10).map((org, index) => ({
            _id: org._id.toString(),
            organizationName: org.name,
            amount: org.subscription?.planId?.price || 0,
            status: 'completed',
            date: new Date(Date.now() - (index * 86400000)).toISOString(),
            planName: org.subscription?.planId?.name || 'Unknown'
        }));
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenueChart = months.map((month, index) => ({
            month,
            revenue: Math.floor(monthlyRevenue * (0.8 + (index * 0.1))),
            subscriptions: Math.floor(activeOrgs * (0.7 + (index * 0.05)))
        }));
        const billing = {
            totalRevenue,
            monthlyRevenue,
            activeSubscriptions: activeOrgs,
            churnRate: totalOrgs > 0 ? ((totalOrgs - activeOrgs) / totalOrgs * 100).toFixed(1) : 0,
            recentTransactions,
            revenueChart
        };
        res.json({ success: true, data: billing });
    }
    catch (error) {
        res.json({ success: false, message: 'Error fetching billing data' });
    }
};
exports.getBilling = getBilling;
