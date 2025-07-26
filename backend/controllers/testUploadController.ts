
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

export const testUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed' 
    });
  }
};

export const getUploadedFiles = async (req: AuthRequest, res: Response) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(uploadsDir).map(filename => ({
      filename,
      url: `/uploads/${filename}`,
      size: fs.statSync(path.join(uploadsDir, filename)).size
    }));

    res.json({ success: true, data: files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get files' 
    });
  }
};
