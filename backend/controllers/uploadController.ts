import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
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

export const uploadImage = upload.single('image');

export const handleImageUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let imageUrl;
    
    try {
      const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
      if (isCloudinaryConfigured()) {
        imageUrl = await uploadToCloudinary(req.file, 'uploads');
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } catch (error) {
      console.error('Cloudinary upload failed, using local:', error);
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const handleDocumentUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { tenantId, description } = req.body;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant ID required' });
    }

    // Upload to S3
    let documentUrl;
    try {
      const s3Service = await import('../services/s3Service');
      const filename = `documents/${Date.now()}-${req.file.originalname}`;
      documentUrl = await s3Service.default.uploadFile(filename, req.file.buffer, req.file.mimetype);
    } catch (error) {
      console.error('S3 upload failed, using local:', error);
      documentUrl = `/uploads/${req.file.filename}`;
    }

    // Update tenant with document
    const Tenant = await import('../models/Tenant');
    await Tenant.default.findByIdAndUpdate(tenantId, {
      $push: {
        documents: {
          url: documentUrl,
          filename: req.file.originalname,
          description: description || 'Document',
          uploadedAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        url: documentUrl,
        filename: req.file.originalname,
        description
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const handleTenantImageUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { tenantId, description } = req.body;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant ID required' });
    }

    // Upload to Cloudinary
    let imageUrl;
    try {
      const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
      if (isCloudinaryConfigured()) {
        imageUrl = await uploadToCloudinary(req.file, 'tenant-uploads');
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } catch (error) {
      console.error('Cloudinary upload failed, using local:', error);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Update tenant with image
    const Tenant = await import('../models/Tenant');
    await Tenant.default.findByIdAndUpdate(tenantId, {
      $push: {
        uploadedImages: {
          url: imageUrl,
          description: description || 'Image',
          uploadedAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        url: imageUrl,
        description
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};