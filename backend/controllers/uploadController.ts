import { Request, Response } from 'express';
import { catchAsync, CustomError } from '../middleware/errorHandler';

export const uploadFile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new CustomError('No file uploaded', 400);
  }

  const fileData = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    url: `/uploads/${req.file.filename}`
  };

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: fileData
  });
});

export const uploadMultipleFiles = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    throw new CustomError('No files uploaded', 400);
  }

  const filesData = files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    url: `/uploads/${file.filename}`
  }));

  res.status(200).json({
    success: true,
    message: `${files.length} files uploaded successfully`,
    data: filesData
  });
});