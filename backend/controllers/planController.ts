import { Request, Response } from 'express';
import Plan from '../models/Plan';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Plan not found' });
  }
};