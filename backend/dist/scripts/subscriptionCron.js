"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSubscriptionCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
const automationService_1 = __importDefault(require("../services/automationService"));
const startSubscriptionCron = () => {
    node_cron_1.default.schedule('0 0 * * *', async () => {
        try {
            console.log('Running daily automation tasks...');
            const expiredCount = await subscriptionService_1.default.checkExpiredSubscriptions();
            console.log(`Updated ${expiredCount} expired subscriptions`);
            await automationService_1.default.runDailyTasks();
            await automationService_1.default.updateOccupancyRates();
            console.log('Daily automation completed successfully');
        }
        catch (error) {
            console.error('Error in daily automation:', error);
        }
    });
    console.log('Daily automation cron job started');
};
exports.startSubscriptionCron = startSubscriptionCron;
