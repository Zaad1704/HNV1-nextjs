"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Reminder_1 = __importDefault(require("../models/Reminder"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Property_1 = __importDefault(require("../models/Property"));
const notificationService_1 = __importDefault(require("./notificationService"));
const mongoose_1 = __importDefault(require("mongoose"));
class ActionChainService {
    async onPaymentRecorded(paymentData, userId, organizationId) {
        const session = await mongoose_1.default.startSession();
        try {
            await session.withTransaction(async () => {
                await this.updateTenantStatus(paymentData.tenantId, organizationId, session);
                await this.cancelOverdueReminders(paymentData.tenantId, paymentData.paymentDate, session);
                await this.updatePropertyCashFlow(paymentData.propertyId, paymentData.amount, 'income', session);
                await this.createAuditLog({
                    userId,
                    organizationId,
                    action: 'payment_recorded',
                    resource: 'payment',
                    resourceId: paymentData._id,
                    details: { amount: paymentData.amount, tenant: paymentData.tenantId }
                }, session);
            });
            const tenant = await Tenant_1.default.findById(paymentData.tenantId);
            if (tenant) {
                await notificationService_1.default.notifyPaymentReceived(tenant.name, paymentData.amount, userId, organizationId);
            }
        }
        catch (error) {
            console.error('Payment chain action error:', error);
            throw error;
        }
        finally {
            await session.endSession();
        }
    }
    async onTenantAdded(tenantData, userId, organizationId) {
        try {
            if (!tenantData || !tenantData._id || !userId || !organizationId) {
                console.error('Invalid data for tenant added action:', { tenantData: !!tenantData, userId: !!userId, organizationId: !!organizationId });
                return;
            }
            if (tenantData.propertyId) {
                try {
                    await this.updatePropertyOccupancy(tenantData.propertyId);
                }
                catch (error) {
                    console.error('Failed to update property occupancy:', error);
                }
            }
            try {
                await this.createNotification({
                    userId,
                    organizationId,
                    type: 'info',
                    title: 'New Tenant Added',
                    message: `${tenantData.name || 'New tenant'} has been added to your property`,
                    link: `/dashboard/tenants/${tenantData._id}`
                });
            }
            catch (error) {
                console.error('Failed to create welcome notification:', error);
            }
            try {
                await this.createRentReminder(tenantData, organizationId);
            }
            catch (error) {
                console.error('Failed to create rent reminder:', error);
            }
            try {
                await this.createAuditLog({
                    userId,
                    organizationId,
                    action: 'tenant_added',
                    resource: 'tenant',
                    resourceId: tenantData._id,
                    details: { name: tenantData.name || 'Unknown', unit: tenantData.unit || 'Unknown' }
                });
            }
            catch (error) {
                console.error('Failed to create audit log:', error);
            }
        }
        catch (error) {
            console.error('Tenant added chain action error:', error);
        }
    }
    async onPropertyAdded(propertyData, userId, organizationId) {
        try {
            await this.initializePropertyCashFlow(propertyData._id);
            await this.createNotification({
                userId,
                organizationId,
                type: 'success',
                title: 'Property Added',
                message: `${propertyData.name} has been added to your portfolio`,
                link: `/dashboard/properties/${propertyData._id}`
            });
            await this.createAuditLog({
                userId,
                organizationId,
                action: 'property_added',
                resource: 'property',
                resourceId: propertyData._id,
                details: { name: propertyData.name, units: propertyData.numberOfUnits }
            });
        }
        catch (error) {
            console.error('Property added chain action error:', error);
        }
    }
    async onMaintenanceCreated(maintenanceData, userId, organizationId) {
        try {
            if (maintenanceData.estimatedCost > 500) {
                await this.createApprovalRequest(maintenanceData, userId, organizationId);
            }
            await this.createNotification({
                userId,
                organizationId,
                type: 'warning',
                title: 'Maintenance Request',
                message: `New maintenance request: ${maintenanceData.description}`,
                link: `/dashboard/maintenance/${maintenanceData._id}`
            });
            if (maintenanceData.priority === 'urgent') {
                await this.updatePropertyMaintenanceStatus(maintenanceData.propertyId, 'urgent_maintenance');
            }
        }
        catch (error) {
            console.error('Maintenance chain action error:', error);
        }
    }
    async updateTenantStatus(tenantId, organizationId, session) {
        try {
            const tenant = await Tenant_1.default.findById(tenantId);
            if (!tenant || tenant.organizationId.toString() !== organizationId.toString())
                return;
            const recentPayment = await Payment_1.default.findOne({
                tenantId,
                organizationId,
                status: { $in: ['Paid', 'completed', 'Completed'] },
                paymentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            tenant.status = recentPayment ? 'Active' : 'Late';
            await tenant.save();
        }
        catch (error) {
            console.error('Update tenant status error:', error);
        }
    }
    async cancelOverdueReminders(tenantId, paymentDate, session) {
        await Reminder_1.default.updateMany({
            tenantId,
            type: 'rent_reminder',
            status: 'active',
            nextRunDate: { $lte: paymentDate }
        }, { status: 'completed' }, { session });
    }
    async updatePropertyCashFlow(propertyId, amount, type, session) {
        try {
            const property = await Property_1.default.findById(propertyId).session(session);
            if (property) {
                if (!property.cashFlow)
                    property.cashFlow = { income: 0, expenses: 0, netIncome: 0 };
                property.cashFlow[type] += (amount || 0);
                property.cashFlow.netIncome = property.cashFlow.income - property.cashFlow.expenses;
                await property.save({ session });
            }
        }
        catch (error) {
            console.error('Update property cash flow error:', error);
            throw error;
        }
    }
    async updatePropertyOccupancy(propertyId) {
        try {
            const property = await Property_1.default.findById(propertyId);
            if (!property)
                return;
            const occupiedUnits = await Tenant_1.default.countDocuments({
                propertyId,
                status: { $in: ['Active', 'Late'] }
            });
            property.occupancyRate = Math.round((occupiedUnits / (property.numberOfUnits || 1)) * 100);
            await property.save();
        }
        catch (error) {
            console.error('Update property occupancy error:', error);
        }
    }
    async createRentReminder(tenantData, organizationId) {
        try {
            if (!tenantData._id || !organizationId) {
                console.error('Missing required data for rent reminder:', { tenantId: !!tenantData._id, organizationId: !!organizationId });
                return;
            }
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(1);
            await Reminder_1.default.create({
                organizationId,
                tenantId: tenantData._id,
                propertyId: tenantData.propertyId || null,
                type: 'rent_reminder',
                title: 'Rent Payment Due',
                message: `Rent payment due for Unit ${tenantData.unit || 'N/A'}`,
                nextRunDate: nextMonth,
                frequency: 'monthly',
                status: 'active'
            });
        }
        catch (error) {
            console.error('Create rent reminder error:', error);
        }
    }
    async createApprovalRequest(maintenanceData, userId, organizationId) {
        try {
            await this.createNotification({
                userId,
                organizationId,
                type: 'warning',
                title: 'Approval Required',
                message: `Maintenance request requires approval: $${maintenanceData.estimatedCost || 0}`,
                actionUrl: `/dashboard/approvals`
            });
        }
        catch (error) {
            console.error('Create approval request error:', error);
        }
    }
    async updatePropertyMaintenanceStatus(propertyId, status) {
        await Property_1.default.findByIdAndUpdate(propertyId, { maintenanceStatus: status });
    }
    async initializePropertyCashFlow(propertyId) {
        await Property_1.default.findByIdAndUpdate(propertyId, {
            cashFlow: { income: 0, expenses: 0, netIncome: 0 },
            occupancyRate: 0
        });
    }
    async createAuditLog(data, session) {
        try {
            const auditData = {
                ...data,
                ipAddress: data.ipAddress || '127.0.0.1',
                userAgent: data.userAgent || 'System',
                timestamp: new Date()
            };
            if (session) {
                await AuditLog_1.default.create([auditData], { session });
            }
            else {
                await AuditLog_1.default.create(auditData);
            }
        }
        catch (error) {
            console.error('Create audit log error:', error);
        }
    }
    async createNotification(data) {
        try {
            if (!data.userId || !data.organizationId) {
                console.error('Missing required data for notification:', { userId: !!data.userId, organizationId: !!data.organizationId });
                return;
            }
            await Notification_1.default.create({
                userId: data.userId,
                organizationId: data.organizationId,
                type: data.type || 'info',
                title: data.title || 'Notification',
                message: data.message || '',
                link: data.link || data.actionUrl || '',
                isRead: false,
                createdAt: new Date()
            });
        }
        catch (error) {
            console.error('Create notification error:', error);
        }
    }
}
exports.default = new ActionChainService();
