import { Request, Response } from 'express';
import Reminder from '../models/Reminder';
import Tenant from '../models/Tenant';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
}

export const getReminders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { tenantId, propertyId, status } = req.query;
    const filter: any = { organizationId: req.user.organizationId };
    
    if (tenantId) filter.tenantId = tenantId;
    if (propertyId) filter.propertyId = propertyId;
    if (status) filter.status = status;

    const reminders = await Reminder.find(filter)
      .populate('tenantId', 'name email unit')
      .populate('propertyId', 'name address')
      .sort({ nextRunDate: 1 });

    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createReminder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { tenantId, propertyId, type, message, nextRunDate, frequency } = req.body;

    if (!tenantId || !propertyId || !type || !nextRunDate || !frequency) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const reminder = await Reminder.create({
      organizationId: req.user.organizationId,
      tenantId,
      propertyId,
      type,
      message: message || `${type.replace('_', ' ')} reminder`,
      nextRunDate: new Date(nextRunDate),
      frequency,
      status: 'active',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};