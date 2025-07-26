"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Organization_1 = __importDefault(require("../models/Organization"));
const User_1 = __importDefault(require("../models/User"));
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const notificationService_1 = __importDefault(require("./notificationService"));
class SuperAdminActionService {
    async onOrganizationDeleted(orgId, adminUserId) {
        try {
            await Promise.all([
                User_1.default.deleteMany({ organizationId: orgId }),
                Property_1.default.deleteMany({ organizationId: orgId }),
                Tenant_1.default.deleteMany({ organizationId: orgId }),
                Payment_1.default.deleteMany({ organizationId: orgId }),
                AuditLog_1.default.deleteMany({ organizationId: orgId })
            ]);
            console.log(`Organization ${orgId} and all related data deleted by super admin`);
        }
        catch (error) {
            console.error('Error in organization deletion chain:', error);
        }
    }
    async onOrganizationStatusChanged(orgId, newStatus, adminUserId) {
        try {
            const org = await Organization_1.default.findById(orgId).populate('owner');
            if (!org)
                return;
            await User_1.default.updateMany({ organizationId: orgId }, { isActive: newStatus === 'Active' });
            await AuditLog_1.default.create({
                userId: adminUserId,
                organizationId: orgId,
                action: `organization_${newStatus}`,
                resource: 'organization',
                resourceId: orgId,
                details: {
                    organizationName: org.name,
                    statusChange: newStatus,
                    affectedUsers: await User_1.default.countDocuments({ organizationId: orgId }),
                    changedBy: 'Super Admin'
                },
                ipAddress: '127.0.0.1',
                userAgent: 'Super Admin Panel',
                timestamp: new Date()
            });
            console.log(`Organization ${org.name} status changed to ${newStatus}`);
        }
        catch (error) {
            console.error('Error in organization status change chain:', error);
        }
    }
    async onPlanUpdated(planId, oldPlan, newPlan, adminUserId) {
        try {
            const orgsWithPlan = await Organization_1.default.find({ 'subscription.planId': planId });
            for (const org of orgsWithPlan) {
                if (org.owner) {
                    await notificationService_1.default.createNotification({
                        userId: org.owner.toString(),
                        organizationId: org._id,
                        type: 'info',
                        title: 'Plan Updated',
                        message: `Your subscription plan "${newPlan.name}" has been updated with new features and pricing.`,
                        link: '/billing'
                    });
                }
                await AuditLog_1.default.create({
                    userId: adminUserId,
                    organizationId: org._id,
                    action: 'plan_updated_by_admin',
                    resource: 'subscription',
                    resourceId: planId,
                    details: {
                        planName: newPlan.name,
                        oldPrice: oldPlan.price,
                        newPrice: newPlan.price,
                        organizationName: org.name
                    },
                    ipAddress: '127.0.0.1',
                    userAgent: 'Super Admin Panel',
                    timestamp: new Date()
                });
            }
            console.log(`Plan ${newPlan.name} updated, ${orgsWithPlan.length} organizations affected`);
        }
        catch (error) {
            console.error('Error in plan update chain:', error);
        }
    }
    async onUserDeleted(userId, userInfo, adminUserId) {
        try {
            const ownedOrgs = await Organization_1.default.find({ owner: userId });
            for (const org of ownedOrgs) {
                const newOwner = await User_1.default.findOne({
                    organizationId: org._id,
                    role: { $in: ['Admin', 'Owner'] },
                    _id: { $ne: userId }
                });
                if (newOwner) {
                    org.owner = newOwner._id;
                    await org.save();
                    await notificationService_1.default.createNotification({
                        userId: newOwner._id,
                        organizationId: org._id,
                        type: 'warning',
                        title: 'Organization Ownership Transferred',
                        message: `You are now the owner of ${org.name} due to previous owner account deletion.`,
                        link: '/dashboard'
                    });
                }
                else {
                    org.status = 'Inactive';
                    await org.save();
                }
            }
            console.log(`User ${userInfo.email} deleted, ${ownedOrgs.length} organizations handled`);
        }
        catch (error) {
            console.error('Error in user deletion chain:', error);
        }
    }
    async onLifetimeAccessGranted(orgId, adminUserId) {
        try {
            const org = await Organization_1.default.findById(orgId);
            if (!org)
                return;
            const orgUsers = await User_1.default.find({ organizationId: orgId });
            for (const user of orgUsers) {
                await notificationService_1.default.createNotification({
                    userId: user._id,
                    organizationId: orgId,
                    type: 'success',
                    title: '🎉 Lifetime Access Granted!',
                    message: 'Your organization now has lifetime access to all premium features!',
                    link: '/dashboard'
                });
            }
            await Organization_1.default.findByIdAndUpdate(orgId, {
                'subscription.grantedAt': new Date(),
                'subscription.grantedBy': adminUserId
            });
            console.log(`Lifetime access granted to organization ${org.name}`);
        }
        catch (error) {
            console.error('Error in lifetime access chain:', error);
        }
    }
    async updateSystemStats() {
        try {
            const stats = {
                totalOrganizations: await Organization_1.default.countDocuments(),
                activeOrganizations: await Organization_1.default.countDocuments({ status: 'active' }),
                totalUsers: await User_1.default.countDocuments(),
                activeUsers: await User_1.default.countDocuments({ isActive: true }),
                totalProperties: await Property_1.default.countDocuments(),
                totalTenants: await Tenant_1.default.countDocuments(),
                totalPayments: await Payment_1.default.countDocuments(),
                lastUpdated: new Date()
            };
            console.log('System stats updated:', stats);
            return stats;
        }
        catch (error) {
            console.error('Error updating system stats:', error);
            return null;
        }
    }
}
exports.default = new SuperAdminActionService();
