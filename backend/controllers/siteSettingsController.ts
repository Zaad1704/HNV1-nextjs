import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

export const getSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'HNV Property Management',
        logo: '/logo.png',
        theme: 'default',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC'
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



export const uploadSiteLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const logoUrl = (req.file as any).location;
    
    // Update site settings with new logo
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { 
        logo: logoUrl,
        updatedAt: new Date(),
        updatedBy: req.user?._id
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      data: { logoUrl, settings },
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ success: false, message: 'Error uploading logo' });
  }
};

export const uploadLandingImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { section, field } = req.body;
    const imageUrl = (req.file as any).location;
    
    // Update site settings with new image
    const updatePath = section && field ? `content.${section}.${field}` : 'landingImage';
    const updateData = {
      [updatePath]: imageUrl,
      updatedAt: new Date(),
      updatedBy: req.user?._id
    };

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      data: { imageUrl, settings },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload landing image error:', error);
    res.status(500).json({ success: false, message: 'Error uploading image' });
  }
};

export const updateSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user?._id
    };

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};