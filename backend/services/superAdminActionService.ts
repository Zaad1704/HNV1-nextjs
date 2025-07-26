import Organization from '../models/Organization';
import User from '../models/User';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import AuditLog from '../models/AuditLog';
import notificationService from './notificationService';

class SuperAdminActionService {
  // When organization is deleted by super admin
  async onOrganizationDeleted(orgId: string, adminUserId: string) {
    try {
      // Delete all related data
      await Promise.all([
        User.deleteMany({ organizationId: orgId }),
        Property.deleteMany({ organizationId: orgId }),
        Tenant.deleteMany({ organizationId: orgId }),
        Payment.deleteMany({ organizationId: orgId }),
        AuditLog.deleteMany({ organizationId: orgId })
      ]);

      console.log(`Organization ${orgId} and all related data deleted by super admin`);
    } catch (error) {
      console.error('Error in organization deletion chain:', error);
    }
  }

  // When organization status changes
  async onOrganizationStatusChanged(orgId: string, newStatus: string, adminUserId: string) {
    try {
      const org = await Organization.findById(orgId).populate('owner');
      if (!org) return;

      // Update all users in organization
      await User.updateMany(
        { organizationId: orgId },
        { isActive: newStatus === 'Active' }
      );

      // Create system-wide audit log
      await AuditLog.create({
        userId: adminUserId,
        organizationId: orgId,
        action: `organization_${newStatus}`,
        resource: 'organization',
        resourceId: orgId,
        details: {
          organizationName: org.name,
          statusChange: newStatus,
          affectedUsers: await User.countDocuments({ organizationId: orgId }),
          changedBy: 'Super Admin'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Super Admin Panel',
        timestamp: new Date()
      });

      console.log(`Organization ${org.name} status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error in organization status change chain:', error);
    }
  }

  // When plan is updated
  async onPlanUpdated(planId: string, oldPlan: any, newPlan: any, adminUserId: string) {
    try {
      // Find all organizations using this plan
      const orgsWithPlan = await Organization.find({ 'subscription.planId': planId });

      // Notify all affected organizations
      for (const org of orgsWithPlan) {
        if (org.owner) {
          await notificationService.createNotification({
            userId: org.owner.toString(),
            organizationId: org._id,
            type: 'info',
            title: 'Plan Updated',
            message: `Your subscription plan "${newPlan.name}" has been updated with new features and pricing.`,
            link: '/billing'
          });
        }

        // Create audit log for each affected organization
        await AuditLog.create({
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
    } catch (error) {
      console.error('Error in plan update chain:', error);
    }
  }

  // When user is deleted by super admin
  async onUserDeleted(userId: string, userInfo: any, adminUserId: string) {
    try {
      // If user was an organization owner, handle ownership transfer
      const ownedOrgs = await Organization.find({ owner: userId });
      
      for (const org of ownedOrgs) {
        // Find another admin in the organization to transfer ownership
        const newOwner = await User.findOne({
          organizationId: org._id,
          role: { $in: ['Admin', 'Owner'] },
          _id: { $ne: userId }
        });

        if (newOwner) {
          org.owner = newOwner._id;
          await org.save();

          // Notify new owner
          await notificationService.createNotification({
            userId: newOwner._id,
            organizationId: org._id,
            type: 'warning',
            title: 'Organization Ownership Transferred',
            message: `You are now the owner of ${org.name} due to previous owner account deletion.`,
            link: '/dashboard'
          });
        } else {
          // No suitable replacement found, deactivate organization
          org.status = 'Inactive';
          await org.save();
        }
      }

      console.log(`User ${userInfo.email} deleted, ${ownedOrgs.length} organizations handled`);
    } catch (error) {
      console.error('Error in user deletion chain:', error);
    }
  }

  // When lifetime access is granted
  async onLifetimeAccessGranted(orgId: string, adminUserId: string) {
    try {
      const org = await Organization.findById(orgId);
      if (!org) return;

      // Create celebration notification for all users in organization
      const orgUsers = await User.find({ organizationId: orgId });
      
      for (const user of orgUsers) {
        await notificationService.createNotification({
          userId: user._id,
          organizationId: orgId,
          type: 'success',
          title: '🎉 Lifetime Access Granted!',
          message: 'Your organization now has lifetime access to all premium features!',
          link: '/dashboard'
        });
      }

      // Update organization metrics
      await Organization.findByIdAndUpdate(orgId, {
        'subscription.grantedAt': new Date(),
        'subscription.grantedBy': adminUserId
      });

      console.log(`Lifetime access granted to organization ${org.name}`);
    } catch (error) {
      console.error('Error in lifetime access chain:', error);
    }
  }

  // System-wide statistics update
  async updateSystemStats() {
    try {
      const stats = {
        totalOrganizations: await Organization.countDocuments(),
        activeOrganizations: await Organization.countDocuments({ status: 'active' }),
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ isActive: true }),
        totalProperties: await Property.countDocuments(),
        totalTenants: await Tenant.countDocuments(),
        totalPayments: await Payment.countDocuments(),
        lastUpdated: new Date()
      };

      // Store in cache or database for quick access
      console.log('System stats updated:', stats);
      return stats;
    } catch (error) {
      console.error('Error updating system stats:', error);
      return null;
    }
  }
}

export default new SuperAdminActionService();