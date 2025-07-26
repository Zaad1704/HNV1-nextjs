import { Request, Response } from 'express';
import notificationService from '../services/notificationService';

interface AuthRequest extends Request {
  user?: any;
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!req.user?.organizationId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const notifications = await notificationService.getNotifications(
      req.user._id, 
      req.user.organizationId
    );

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const success = await notificationService.markAsRead(id, req.user._id);
    
    if (success) {
      res.json({ success: true, message: 'Notification marked as read' });
    } else {
      res.status(404).json({ success: false, message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await notificationService.markAllAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};