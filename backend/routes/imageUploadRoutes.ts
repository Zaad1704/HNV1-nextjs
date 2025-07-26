import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Image upload endpoint
router.post('/', upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    
    const { uploadToS3 } = require('../middleware/uploadMiddleware');
    const { url, filename } = await uploadToS3(req.file, 'image');
    
    res.status(200).json({
      success: true,
      data: {
        url,
        filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

export default router;