import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { generateColorfulPdfExport } from '../utils/exportGenerator';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Expense from '../models/Expense';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
}

export const createExportRequest = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, format, filters = {}, options = {} } = req.body;
  
  if (!type || !format) {
    res.status(400).json({
      success: false,
      message: 'Type and format are required'
    });
    return;
  }
  
  const validTypes = ['properties', 'tenants', 'payments', 'maintenance', 'expenses'];
  const validFormats = ['pdf', 'csv', 'excel'];
  
  if (!validTypes.includes(type)) {
    res.status(400).json({
      success: false,
      message: 'Invalid export type'
    });
    return;
  }
  
  if (!validFormats.includes(format)) {
    res.status(400).json({
      success: false,
      message: 'Invalid export format'
    });
    return;
  }

  try {
    // Get data based on type
    let data: any[] = [];
    const baseQuery = { organizationId: req.user!.organizationId, ...filters };
    
    switch (type) {
      case 'properties':
        data = await Property.find(baseQuery).populate('createdBy', 'name').lean();
        break;
      case 'tenants':
        data = await Tenant.find(baseQuery).populate('propertyId', 'name').lean();
        break;
      case 'payments':
        data = await Payment.find(baseQuery)
          .populate('tenantId', 'name')
          .populate('propertyId', 'name')
          .lean();
        break;
      case 'maintenance':
        data = await MaintenanceRequest.find(baseQuery)
          .populate('tenantId', 'name')
          .populate('propertyId', 'name')
          .populate('assignedTo', 'name')
          .lean();
        break;
      case 'expenses':
        data = await Expense.find(baseQuery)
          .populate('propertyId', 'name')
          .lean();
        break;
    }

    if (format === 'pdf') {
      // Generate PDF export
      const fileName = `${type}-export-${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), 'uploads', fileName);
      
      // Ensure uploads directory exists
      const uploadsDir = path.dirname(filePath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      await generateColorfulPdfExport(data, { type, format, filters, options }, filePath);
      
      // Send file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Clean up file after sending
      fileStream.on('end', () => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
      });
    } else {
      // For CSV/Excel, return data for now
      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
        type,
        format
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate export',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const getExportStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // For now, return a simple status since we're doing direct exports
  res.json({
    success: true,
    data: {
      id,
      status: 'completed',
      organizationId: req.user!.organizationId
    }
  });
});

export const downloadExport = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // For direct exports, redirect to create export
  res.status(400).json({
    success: false,
    message: 'Use POST /exports to generate and download exports directly'
  });
});