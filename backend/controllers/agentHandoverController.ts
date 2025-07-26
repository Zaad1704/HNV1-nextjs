import { Request, Response } from 'express';
import AgentHandover from '../models/AgentHandover';
import { uploadToCloudinary } from '../utils/cloudinary';

interface AuthRequest extends Request {
  user?: any;
}

export const createAgentHandover = async (req: AuthRequest, res: Response) => {
  try {
    const {
      agentName,
      collectionDate,
      handoverDate,
      totalAmount,
      handoverMethod,
      bankDetails,
      referenceNumber,
      notes,
      propertyIds
    } = req.body;

    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    // Upload handover proof image
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.handoverProof || !files.handoverProof[0]) {
      return res.status(400).json({
        success: false,
        message: 'Handover proof image is required'
      });
    }

    const handoverProofUrl = await uploadToCloudinary(files.handoverProof[0]);
    let collectionSheetUrl = null;

    // Upload collection sheet if provided
    if (files.collectionSheet && files.collectionSheet[0]) {
      collectionSheetUrl = await uploadToCloudinary(files.collectionSheet[0]);
    }

    const agentHandover = new AgentHandover({
      agentName,
      organizationId: req.user.organizationId,
      collectionDate: new Date(collectionDate),
      handoverDate: new Date(handoverDate),
      totalAmount: parseFloat(totalAmount),
      handoverMethod,
      bankDetails,
      referenceNumber,
      notes,
      propertyIds: JSON.parse(propertyIds || '[]'),
      handoverProofUrl,
      collectionSheetUrl,
      recordedBy: req.user._id,
      status: 'pending'
    });

    await agentHandover.save();

    res.status(201).json({
      success: true,
      message: 'Agent handover recorded successfully',
      data: agentHandover
    });
  } catch (error) {
    console.error('Create agent handover error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record agent handover'
    });
  }
};

export const getAgentHandovers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const { page = 1, limit = 10, agentName, status } = req.query;
    const query: any = { organizationId: req.user.organizationId };

    if (agentName) {
      query.agentName = { $regex: agentName, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const handovers = await AgentHandover.find(query)
      .populate('propertyIds', 'name')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AgentHandover.countDocuments(query);

    res.status(200).json({
      success: true,
      data: handovers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get agent handovers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent handovers'
    });
  }
};

export const updateHandoverStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'disputed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const handover = await AgentHandover.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: 'Agent handover not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Handover status updated successfully',
      data: handover
    });
  } catch (error) {
    console.error('Update handover status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update handover status'
    });
  }
};