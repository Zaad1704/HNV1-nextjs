
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadImage, handleImageUpload, handleDocumentUpload, handleTenantImageUpload } from '../controllers/uploadController';
import { testUpload, getUploadedFiles } from '../controllers/testUploadController';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

// Main upload routes
router.post('/image', upload.single('image'), handleImageUpload);
router.post('/file', upload.single('file'), handleImageUpload);

// Tenant document uploads
router.post('/document', upload.single('document'), handleDocumentUpload);
router.post('/tenant-image', upload.single('image'), handleTenantImageUpload);

// Test upload routes
router.post('/test', upload.single('image'), testUpload);
router.get('/files', getUploadedFiles);

// Health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upload service ready',
    timestamp: new Date().toISOString()
  });
});

export default router;
