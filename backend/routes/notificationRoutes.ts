import express from 'express';
import { requireOrganization } from '../middleware/auth';

const router = express.Router();

router.get('/', requireOrganization, async (req, res) => {
  // Real-time notifications are handled via Socket.IO
  res.json({
    success: true,
    message: 'Real-time notifications active via WebSocket',
    data: []
  });
});

router.post('/test', requireOrganization, async (req, res) => {
  const io = req.app.get('io');
  io.to(`org-${req.user!.organization}`).emit('notification', {
    id: Date.now().toString(),
    type: 'system',
    title: 'Test Notification',
    message: 'This is a test notification',
    timestamp: new Date()
  });
  
  res.json({
    success: true,
    message: 'Test notification sent'
  });
});

export default router;