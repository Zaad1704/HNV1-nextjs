"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = __importDefault(require("../models/Webhook"));
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
class WebhookService {
    async trigger(organizationId, event, data) {
        try {
            const webhooks = await Webhook_1.default.find({
                organizationId,
                events: event,
                isActive: true,
                failureCount: { $lt: 5 }
            });
            for (const webhook of webhooks) {
                await this.sendWebhook(webhook, event, data);
            }
        }
        catch (error) {
            console.error('Webhook trigger error:', error);
        }
    }
    async sendWebhook(webhook, event, data) {
        try {
            const payload = { event, data, timestamp: new Date().toISOString() };
            const signature = crypto_1.default.createHmac('sha256', webhook.secret)
                .update(JSON.stringify(payload))
                .digest('hex');
            await axios_1.default.post(webhook.url, payload, {
                headers: {
                    'X-Webhook-Signature': `sha256=${signature}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            webhook.lastTriggered = new Date();
            webhook.failureCount = 0;
            await webhook.save();
        }
        catch (error) {
            webhook.failureCount += 1;
            if (webhook.failureCount >= 5) {
                webhook.isActive = false;
            }
            await webhook.save();
            console.error(`Webhook failed for ${webhook.url}:`, error.message);
        }
    }
    async create(organizationId, url, events) {
        const secret = crypto_1.default.randomBytes(32).toString('hex');
        return await Webhook_1.default.create({
            organizationId,
            url,
            events,
            secret,
            isActive: true,
            failureCount: 0
        });
    }
}
exports.default = new WebhookService();
