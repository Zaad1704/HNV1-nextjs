import { Request, Response } from 'express';
import subscriptionService from '../services/subscriptionService';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

interface AuthRequest extends Request {
  user?: any;
}

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(200).json({
        success: true,
        data: { hasSubscription: false, status: null }
      });
    }

    const status = await subscriptionService.getSubscriptionStatus(req.user.organizationId);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createTrialSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ success: false, message: 'Organization required' });
    }

    const { planId } = req.body;
    const subscription = await subscriptionService.createTrialSubscription(
      req.user.organizationId, 
      planId
    );

    res.json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const activateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ success: false, message: 'Organization required' });
    }

    const { planId } = req.body;
    const existingSubscription = await Subscription.findOne({ organizationId: req.user.organizationId });
    const subscription = await subscriptionService.activateSubscription(existingSubscription?._id?.toString() || '');

    res.json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ success: false, message: 'Organization required' });
    }

    const existingSubscription = await Subscription.findOne({ organizationId: req.user.organizationId });
    const subscription = await subscriptionService.cancelSubscription(existingSubscription?._id?.toString() || '');
    res.json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reactivateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({ success: false, message: 'Organization required' });
    }

    const existingSubscription = await Subscription.findOne({ organizationId: req.user.organizationId });
    const subscription = await subscriptionService.reactivateSubscription(existingSubscription?._id?.toString() || '');
    res.json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailablePlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true, isPublic: true }).sort({ price: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin functions
export const getAllSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const subscriptions = await Subscription.find({})
      .populate('organizationId', 'name owner')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params;
    const updates = req.body;

    const subscription = await Subscription.findByIdAndUpdate(id, updates, { new: true })
      .populate('organizationId', 'name')
      .populate('planId', 'name price');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};