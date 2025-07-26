import { Router } from 'express';

const router = Router();

// Test route to verify API is working
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

export default router;