import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Notification from '../models/Notification';

const router = Router();

// Mark notification as read
router.patch('/mark-as-read/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)._id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', protect, async (req, res) => {
  try {
    const userId = (req.user as any)._id;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get chat history
router.get('/chat-history', protect, async (req, res) => {
  try {
    const userId = (req.user as any)._id;
    
    // For now, return empty array - implement chat system later
    const chatHistory = {
      messages: [],
      hasMore: false,
      total: 0
    };
    
    res.status(200).json({
      success: true,
      data: chatHistory,
      message: 'Chat history retrieved'
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all notifications
router.get('/', protect, async (req, res) => {
  try {
    const userId = (req.user as any)._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    
    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      },
      message: 'Notifications retrieved'
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create notification (for system use)
router.post('/', protect, async (req, res) => {
  try {
    const { title, message, type, actionUrl } = req.body;
    const userId = (req.user as any)._id;
    
    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'info',
      actionUrl,
      isRead: false
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;