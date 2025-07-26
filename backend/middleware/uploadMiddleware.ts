import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { S3_CONFIG } from '../config/aws';
import s3Service from '../services/s3Service';

// File filter for security
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|webp|svg|bmp|tiff/;
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!file || !file.originalname || !file.mimetype) {
      console.log('Invalid file object:', file);
      return cb(new Error('Invalid file upload'));
    }
    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      console.log('File rejected:', { originalname: file.originalname, mimetype: file.mimetype, fieldname: file.fieldname });
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images and documents are allowed.`));
    }
  } catch (error) {
    console.error('File filter error:', error);
    cb(new Error('File validation failed'));
  }
};

// Helper function to organize files in S3 folders
function getUploadFolder(fieldname: string): string {
  switch (fieldname) {
    case 'logo':
    case 'image':
      return 'site-assets';
    case 'profile':
    case 'avatar':
      return 'profiles';
    case 'property':
      return 'properties';
    case 'tenantImage':
    case 'govtIdFront':
    case 'govtIdBack':
      return 'tenants';
    case 'document':
      return 'documents';
    default:
      return 'uploads';
  }
}

// Disk storage for local file uploads
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadDir = path.join(__dirname, '../uploads/images');
    // Ensure directory exists
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

// Memory storage for processing before S3 upload
const memoryStorage = multer.memoryStorage();

// Default upload with disk storage
const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 15, // Maximum 15 files
    fields: 50 // Maximum 50 fields for comprehensive tenant form
  },
  fileFilter: fileFilter
});

// S3 upload with memory storage
const uploadToMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 15,
    fields: 50
  },
  fileFilter: fileFilter
});

// Custom S3 upload handler
export const uploadToS3 = async (file: Express.Multer.File, fieldname: string) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const folder = getUploadFolder(fieldname);
  const filename = `${folder}/${fieldname}-${uniqueSuffix}${extension}`;
  
  const url = await s3Service.uploadFile(filename, file.buffer, file.mimetype);
  return { url, filename };
};

export { uploadToMemory };
export default upload;