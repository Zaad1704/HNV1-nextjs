"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Reminder_1 = __importDefault(require("../models/Reminder"));
const Property_1 = __importDefault(require("../models/Property"));
const notificationService_1 = __importDefault(require("./notificationService"));
class AutomationService {
    async runDailyTasks() {
        try {
            await this.checkOverdueRent();
            await this.checkExpiringLeases();
            await this.processReminders();
            console.log('Daily automation tasks completed');
        }
        catch (error) {
            console.error('Daily automation error:', error);
        }
    }
    async checkOverdueRent() {
        const today = new Date();
        const tenants = await Tenant_1.default.find({ status: 'Active' });
        for (const tenant of tenants) {
            const lastPayment = await Payment_1.default.findOne({
                tenantId: tenant._id,
                status: 'Paid'
            }).sort({ paymentDate: -1 });
            if (lastPayment) {
                const daysSincePayment = Math.floor((today.getTime() - new Date(lastPayment.paymentDate).getTime()) /
                    (1000 * 60 * 60 * 24));
                if (daysSincePayment > 30) {
                    tenant.status = 'Late';
                    await tenant.save();
                    await notificationService_1.default.notifyRentOverdue(tenant.name, daysSincePayment - 30, tenant.createdBy?.toString() || '', tenant.organizationId.toString());
                    const existingReminder = await Reminder_1.default.findOne({
                        tenantId: tenant._id,
                        type: 'rent_reminder',
                        status: 'active'
                    });
                    if (!existingReminder) {
                        await Reminder_1.default.create({
                            organizationId: tenant.organizationId,
                            tenantId: tenant._id,
                            propertyId: tenant.propertyId,
                            type: 'rent_reminder',
                            message: `Rent payment overdue for ${tenant.name}`,
                            nextRunDate: new Date(),
                            frequency: 'weekly',
                            status: 'active'
                        });
                    }
                }
            }
        }
    }
    async checkExpiringLeases() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringTenants = await Tenant_1.default.find({
            leaseEndDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
            status: 'Active'
        });
        for (const tenant of expiringTenants) {
            const daysLeft = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24));
            await notificationService_1.default.notifyLeaseExpiring(tenant.name, daysLeft, tenant.createdBy?.toString() || '', tenant.organizationId.toString());
        }
    }
    async processReminders() {
        const dueReminders = await Reminder_1.default.find({
            status: 'active',
            nextRunDate: { $lte: new Date() }
        }).populate('tenantId').populate('propertyId');
        for (const reminder of dueReminders) {
            try {
                if (reminder.type === 'rent_due') {
                    const tenant = reminder.tenantId;
                    await notificationService_1.default.notifyRentOverdue(tenant.name, 0, reminder.createdBy?.toString() || '', reminder.organizationId.toString());
                }
                reminder.executionCount += 1;
                reminder.lastRunDate = new Date();
                const nextRun = new Date();
                switch (reminder.frequency) {
                    case 'daily':
                        nextRun.setDate(nextRun.getDate() + 1);
                        break;
                    case 'weekly':
                        nextRun.setDate(nextRun.getDate() + 7);
                        break;
                    case 'monthly':
                        nextRun.setMonth(nextRun.getMonth() + 1);
                        break;
                }
                reminder.nextRunDate = nextRun;
                await reminder.save();
            }
            catch (error) {
                console.error(`Error processing reminder ${reminder._id}:`, error);
            }
        }
    }
    async updateOccupancyRates() {
        const properties = await Property_1.default.find();
        for (const property of properties) {
            const occupiedUnits = await Tenant_1.default.countDocuments({
                propertyId: property._id,
                status: { $in: ['Active', 'Late'] }
            });
            property.occupancyRate = (occupiedUnits / property.numberOfUnits) * 100;
            await property.save();
        }
    }
}
exports.default = new AutomationService();
