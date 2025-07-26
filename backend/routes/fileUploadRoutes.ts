import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadImage } from '../controllers/fileUploadController';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Apply authentication middleware
router.use(protect);

// File upload routes
router.post('/image', upload.single('image'), uploadImage);
router.post('/upload', upload.single('file'), uploadImage);

// Basic route for testing
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'File upload service ready',
    timestamp: new Date().toISOString()
  });
});

export default router;
