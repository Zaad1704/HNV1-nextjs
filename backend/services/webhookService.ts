import Webhook from '../models/Webhook';
import crypto from 'crypto';
import axios from 'axios';

class WebhookService {
  async trigger(organizationId: string, event: string, data: any) {
    try {
      const webhooks = await Webhook.find({
        organizationId,
        events: event,
        isActive: true,
        failureCount: { $lt: 5 }
      });

      for (const webhook of webhooks) {
        await this.sendWebhook(webhook, event, data);
      }
    } catch (error) {
      console.error('Webhook trigger error:', error);
    }
  }

  private async sendWebhook(webhook: any, event: string, data: any) {
    try {
      const payload = { event, data, timestamp: new Date().toISOString() };
      const signature = crypto.createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      await axios.post(webhook.url, payload, {
        headers: {
          'X-Webhook-Signature': `sha256=${signature}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      webhook.lastTriggered = new Date();
      webhook.failureCount = 0;
      await webhook.save();
    } catch (error) {
      webhook.failureCount += 1;
      if (webhook.failureCount >= 5) {
        webhook.isActive = false;
      }
      await webhook.save();
      console.error(`Webhook failed for ${webhook.url}:`, error.message);
    }
  }

  async create(organizationId: string, url: string, events: string[]) {
    const secret = crypto.randomBytes(32).toString('hex');
    return await Webhook.create({
      organizationId,
      url,
      events,
      secret,
      isActive: true,
      failureCount: 0
    });
  }
}

export default new WebhookService();