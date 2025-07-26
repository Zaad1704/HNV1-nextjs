import { Request, Response } from 'express';
import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

// Google Drive API Setup (optional configuration)
let auth: any;
let drive: any;
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;
let isGoogleDriveConfigured = false;

try {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
  if (credentials.client_email && credentials.private_key) {
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    drive = google.drive({ version: 'v3', auth });
    isGoogleDriveConfigured = true;
  } else {
    console.warn('⚠️ Google Drive upload service not configured - file uploads will be disabled');
  }
} catch (error) {
  console.warn('Google Drive credentials parsing failed - file uploads will be disabled:', error);
}

export const uploadImage = async (req: AuthRequest, res: Response) => {
  if (!isGoogleDriveConfigured) {
    return res.status(503).json({
      success: false,
      message: 'File upload service is not configured. Please contact administrator.'
    });
  }

  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No file uploaded.' 
    });
  }

  try {
    const file = req.file;
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const uniqueFilename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;

    const fileMetadata = {
      name: uniqueFilename,
      parents: UPLOAD_FOLDER_ID ? [UPLOAD_FOLDER_ID] : undefined,
    };

    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;
    
    // Make file publicly viewable
    await drive.permissions.create({
      fileId: fileId,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const imageUrl = `https://drive.google.com/uc?id=${fileId}`;
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        fileId: fileId,
        filename: uniqueFilename,
        originalName: file.originalname,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Google Drive upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed. Please try again.' 
    });
  }
};