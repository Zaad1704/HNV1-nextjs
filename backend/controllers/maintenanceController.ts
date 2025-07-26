import { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest';
import { catchAsync, CustomError } from '../middleware/errorHandler';
import notificationService from '../services/notificationService';

export const getMaintenanceRequests = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, priority, property } = req.query;
  
  const query: any = { organization: req.user!.organization };
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (property) query.property = property;

  const requests = await MaintenanceRequest.find(query)
    .populate('tenant', 'firstName lastName email')
    .populate('property', 'name address')
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await MaintenanceRequest.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const createMaintenanceRequest = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const requestData = {
    ...req.body,
    organization: req.user!.organization
  };

  const request = await MaintenanceRequest.create(requestData);

  // Send notification
  await notificationService.sendNotification({
    userId: req.user!._id.toString(),
    organizationId: req.user!.organization!.toString(),
    type: 'maintenance',
    title: 'New Maintenance Request',
    message: `New maintenance request: ${request.title}`,
    data: { requestId: request._id }
  });

  res.status(201).json({
    success: true,
    message: 'Maintenance request created successfully',
    data: { request }
  });
});

export const updateMaintenanceRequest = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const request = await MaintenanceRequest.findOneAndUpdate(
    { _id: req.params.id, organization: req.user!.organization },
    req.body,
    { new: true, runValidators: true }
  ).populate('tenant', 'firstName lastName email');

  if (!request) {
    throw new CustomError('Maintenance request not found', 404);
  }

  // Send status update notification
  if (req.body.status && request.tenant) {
    await notificationService.sendMaintenanceUpdate(
      (request.tenant as any).email,
      (request.tenant as any).firstName,
      request._id.toString(),
      request.status
    );
  }

  res.status(200).json({
    success: true,
    message: 'Maintenance request updated successfully',
    data: { request }
  });
});