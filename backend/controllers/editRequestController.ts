import { Request, Response } from 'express';
import EditRequest from '../models/EditRequest';

interface AuthRequest extends Request {
  user?: any;
}

export const getEditRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const editRequests = await EditRequest.find({ 
      organizationId: req.user.organizationId,
      status: 'pending'
    })
    .populate('requester', 'name email')
    .populate('resourceId')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    res.status(200).json({ success: true, data: editRequests || [] });
  } catch (error) {
    console.error('Error fetching edit requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch edit requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { resourceId, resourceModel, reason } = req.body;

    if (!resourceId || !resourceModel || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Resource ID, model, and reason are required' 
      });
    }

    const editRequest = await EditRequest.create({
      resourceId,
      resourceModel,
      reason,
      organizationId: req.user.organizationId,
      requester: req.user._id,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: editRequest });
  } catch (error) {
    console.error('Error creating edit request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be approved or rejected' 
      });
    }

    const editRequest = await EditRequest.findByIdAndUpdate(
      id,
      { 
        status,
        approver: req.user._id
      },
      { new: true }
    ).populate('requester', 'name email');

    if (!editRequest) {
      return res.status(404).json({ success: false, message: 'Edit request not found' });
    }

    res.json({ success: true, data: editRequest });
  } catch (error) {
    console.error('Error updating edit request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const approveEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const editRequest = await EditRequest.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        approver: req.user._id
      },
      { new: true }
    );

    if (!editRequest) {
      return res.status(404).json({ success: false, message: 'Edit request not found' });
    }

    res.json({ success: true, data: editRequest });
  } catch (error) {
    console.error('Error approving edit request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const rejectEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const editRequest = await EditRequest.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        approver: req.user._id
      },
      { new: true }
    );

    if (!editRequest) {
      return res.status(404).json({ success: false, message: 'Edit request not found' });
    }

    res.json({ success: true, data: editRequest });
  } catch (error) {
    console.error('Error rejecting edit request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};