import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import Organization from '../models/Organization';
import User from '../models/User';
import twocheckoutService from '../services/twocheckoutService';
import subscriptionService from '../services/subscriptionService';

interface AuthRequest extends Request {
  user?: any;
}

export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .sort({ sortOrder: 1, price: 1 });

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
};

export const getCurrentSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    }).populate('planId');

    const organization = await Organization.findById(req.user.organizationId);
    
    // Get subscription countdown info
    const countdown = await subscriptionService.getSubscriptionCountdown(req.user.organizationId);
    
    // Check subscription status
    const statusCheck = await subscriptionService.checkSubscriptionStatus(req.user.organizationId);

    res.status(200).json({
      success: true,
      data: {
        subscription,
        organization,
        user: req.user,
        countdown,
        statusCheck
      }
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details'
    });
  }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;

    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Generate external reference
    const externalReference = `org_${req.user.organizationId}_plan_${planId}_${Date.now()}`;

    // Create 2Checkout buy link
    const buyLink = twocheckoutService.generateBuyLink({
      productId: plan.twocheckoutProductId || plan._id.toString(),
      customerEmail: req.user.email,
      customerName: req.user.name || organization.name,
      currency: plan.currency,
      returnUrl: `${process.env.FRONTEND_URL}/billing/success?ref=${externalReference}`,
      cancelUrl: `${process.env.FRONTEND_URL}/billing/cancel`,
      externalReference
    });

    // Store pending subscription
    const pendingSubscription = new Subscription({
      organizationId: req.user.organizationId,
      planId: plan._id,
      status: 'inactive',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (plan.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      amount: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      paymentMethod: 'card',
      features: plan.features,
      limits: plan.limits,
      usage: {
        properties: 0,
        tenants: 0,
        users: 0,
        storage: 0,
        exports: 0,
        lastReset: new Date()
      }
    });

    await pendingSubscription.save();

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: buyLink,
        externalReference,
        subscriptionId: pendingSubscription._id
      }
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
};

export const handlePaymentSuccess = async (req: AuthRequest, res: Response) => {
  try {
    const { externalReference, twocheckoutOrderId } = req.body;

    if (!externalReference) {
      return res.status(400).json({
        success: false,
        message: 'External reference is required'
      });
    }

    // Extract organization ID from external reference
    const orgIdMatch = externalReference.match(/org_([^_]+)_/);
    if (!orgIdMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid external reference format'
      });
    }

    const organizationId = orgIdMatch[1];

    // Find and update subscription
    const subscription = await Subscription.findOne({
      organizationId,
      status: 'inactive'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Update subscription status
    subscription.status = 'active';
    subscription.twocheckoutSubscriptionId = twocheckoutOrderId;
    subscription.lastPaymentDate = new Date();
    subscription.nextBillingDate = new Date(Date.now() + (subscription.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
    
    await subscription.save();

    // Update organization status
    await Organization.findByIdAndUpdate(organizationId, {
      status: 'active',
      subscriptionId: subscription._id
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Handle payment success error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment success'
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-2checkout-signature'] as string;
    const ipnData = req.body;

    // Verify IPN signature
    if (!twocheckoutService.verifyIPN(ipnData, signature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IPN signature'
      });
    }

    const { MESSAGE_TYPE, REFNO, IPN_PID, IPN_PNAME, ORDERSTATUS } = ipnData;

    switch (MESSAGE_TYPE) {
      case 'ORDER_CREATED':
        await handleOrderCreated(ipnData);
        break;
      case 'PAYMENT_AUTHORIZED':
        await handlePaymentAuthorized(ipnData);
        break;
      case 'PAYMENT_RECEIVED':
        await handlePaymentReceived(ipnData);
        break;
      case 'SUBSCRIPTION_CANCELED':
        await handleSubscriptionCanceled(ipnData);
        break;
      case 'SUBSCRIPTION_EXPIRED':
        await handleSubscriptionExpired(ipnData);
        break;
      default:
        console.log('Unhandled webhook event:', MESSAGE_TYPE);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

async function handleOrderCreated(ipnData: any) {
  console.log('Order created:', ipnData.REFNO);
}

async function handlePaymentAuthorized(ipnData: any) {
  console.log('Payment authorized:', ipnData.REFNO);
}

async function handlePaymentReceived(ipnData: any) {
  try {
    const subscription = await Subscription.findOne({
      twocheckoutSubscriptionId: ipnData.REFNO
    });

    if (subscription) {
      subscription.status = 'active';
      subscription.lastPaymentDate = new Date();
      subscription.nextBillingDate = new Date(Date.now() + (subscription.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
      subscription.failedPaymentAttempts = 0;
      
      await subscription.save();
      
      console.log('Payment received for subscription:', subscription._id);
    }
  } catch (error) {
    console.error('Handle payment received error:', error);
  }
}

async function handleSubscriptionCanceled(ipnData: any) {
  try {
    const subscription = await Subscription.findOne({
      twocheckoutSubscriptionId: ipnData.REFNO
    });

    if (subscription) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      
      await subscription.save();
      
      console.log('Subscription canceled:', subscription._id);
    }
  } catch (error) {
    console.error('Handle subscription canceled error:', error);
  }
}

async function handleSubscriptionExpired(ipnData: any) {
  try {
    const subscription = await Subscription.findOne({
      twocheckoutSubscriptionId: ipnData.REFNO
    });

    if (subscription) {
      subscription.status = 'expired';
      subscription.endedAt = new Date();
      
      await subscription.save();
      
      console.log('Subscription expired:', subscription._id);
    }
  } catch (error) {
    console.error('Handle subscription expired error:', error);
  }
}

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Active subscription not found'
      });
    }

    // Cancel with 2Checkout if subscription ID exists
    if (subscription.twocheckoutSubscriptionId) {
      const result = await twocheckoutService.cancelSubscription(subscription.twocheckoutSubscriptionId);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }
    }

    // Update local subscription
    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();
    
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      data: subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

export const getUsageStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Get actual usage counts
    const Property = (await import('../models/Property')).default;
    const Tenant = (await import('../models/Tenant')).default;
    const User = (await import('../models/User')).default;

    const [propertyCount, tenantCount, userCount] = await Promise.all([
      Property.countDocuments({ organizationId: req.user.organizationId }),
      Tenant.countDocuments({ organizationId: req.user.organizationId }),
      User.countDocuments({ organizationId: req.user.organizationId })
    ]);

    // Update usage in subscription
    subscription.usage.properties = propertyCount;
    subscription.usage.tenants = tenantCount;
    subscription.usage.users = userCount;
    
    await subscription.save();

    res.status(200).json({
      success: true,
      data: {
        usage: subscription.usage,
        limits: subscription.limits,
        utilizationPercentage: {
          properties: Math.round((propertyCount / subscription.limits.properties) * 100),
          tenants: Math.round((tenantCount / subscription.limits.tenants) * 100),
          users: Math.round((userCount / subscription.limits.users) * 100)
        }
      }
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage statistics'
    });
  }
};