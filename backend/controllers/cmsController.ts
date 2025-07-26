import { Request, Response, NextFunction } from 'express';
import CMSContent from '../models/CMSContent';

interface AuthRequest extends Request {
  user?: any;
}

interface UpdateBody { 
  [key: string]: any;
}

// Get all content (for SuperAdmin)
export async function getAllContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await CMSContent.find();
    // Transform array into object with key-value pairs
    const content = items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
}

// Update or create content item
export async function updateContent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    const updates = req.body;
    const results = [];

    // Process each update
    for (const [key, value] of Object.entries(updates)) {
      const updatedItem = await CMSContent.findOneAndUpdate(
        { key },
        { 
          key, 
          value, 
          updatedBy: req.user._id,
          updatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true 
        }
      );
      results.push(updatedItem);
    }

    res.json({ 
      success: true, 
      data: results,
      message: 'Content updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

// Get specific content by key
export async function getContentByKey(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = req.params;
    const content = await CMSContent.findOne({ key });
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }

    res.json({ 
      success: true, 
      data: content 
    });
  } catch (error) {
    next(error);
  }
}

// Delete content by key
export async function deleteContent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    const { key } = req.params;
    const deletedContent = await CMSContent.findOneAndDelete({ key });
    
    if (!deletedContent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Content deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
}