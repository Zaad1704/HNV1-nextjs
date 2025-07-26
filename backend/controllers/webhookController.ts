import { Request, Response } from 'express';
import subscriptionService from '../services/subscriptionService';
import Subscription from '../models/Subscription';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    switch (type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(data.object);
        break;
      default:
        console.log(`Unhandled webhook event: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
};

const handlePaymentSucceeded = async (invoice: any) => {
  try {
    const subscription = await Subscription.findOne({ 
      externalId: invoice.subscription 
    });
    
    if (subscription) {
      subscription.status = 'active';
      const nextPeriod = new Date(invoice.period_end * 1000);
      subscription.currentPeriodEndsAt = nextPeriod;
      await subscription.save();
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
};

const handlePaymentFailed = async (invoice: any) => {
  try {
    const subscription = await Subscription.findOne({ 
      externalId: invoice.subscription 
    });
    
    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

const handleSubscriptionCanceled = async (subscription: any) => {
  try {
    const sub = await Subscription.findOne({ 
      externalId: subscription.id 
    });
    
    if (sub) {
      sub.status = 'canceled';
      await sub.save();
    }
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
};

const handleSubscriptionUpdated = async (subscription: any) => {
  try {
    const sub = await Subscription.findOne({ 
      externalId: subscription.id 
    });
    
    if (sub) {
      sub.status = subscription.status === 'active' ? 'active' : 'inactive';
      sub.currentPeriodEndsAt = new Date(subscription.current_period_end * 1000);
      await sub.save();
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
};