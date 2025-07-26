import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Get chat history
router.get('/chat-history', protect, async (req, res) => {
  try {
    const userId = (req.user as any)._id;
    
    // Mock chat history for now
    const chatHistory = {
      messages: [
        {
          id: '1',
          text: 'Hello! How can we help you today?',
          sender: 'admin',
          timestamp: new Date(),
          senderName: 'Support Team',
          senderRole: 'Super Admin'
        }
      ],
      hasMore: false,
      total: 1
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

// Send message
router.post('/send-message', protect, async (req, res) => {
  try {
    const { message, userId, userName, userRole } = req.body;
    
    // Mock message sending for now
    console.log('Message received:', { message, userId, userName, userRole });
    
    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;