import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

const mockRequests = [
  {
    _id: '1',
    title: 'Leaky faucet in kitchen',
    description: 'Kitchen faucet has been dripping for 3 days',
    status: 'open',
    priority: 'medium',
    category: 'plumbing',
    tenant: { firstName: 'John', lastName: 'Doe' },
    property: { name: 'Sunset Apartments' },
    createdAt: new Date()
  },
  {
    _id: '2',
    title: 'AC not cooling properly',
    description: 'Air conditioning unit not maintaining temperature',
    status: 'in_progress',
    priority: 'high',
    category: 'hvac',
    tenant: { firstName: 'Jane', lastName: 'Smith' },
    property: { name: 'Downtown Lofts' },
    createdAt: new Date()
  }
];

export const getMaintenanceRequests = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      requests: mockRequests,
      pagination: { page: 1, limit: 10, total: mockRequests.length, pages: 1 }
    }
  });
});

export const createMaintenanceRequest = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const newRequest = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'open',
    createdAt: new Date()
  };
  mockRequests.push(newRequest);
  
  res.status(201).json({
    success: true,
    message: 'Maintenance request created successfully',
    data: { request: newRequest }
  });
});

export const updateMaintenanceRequest = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockRequests.findIndex(r => r._id === req.params.id);
  if (index !== -1) {
    mockRequests[index] = { ...mockRequests[index], ...req.body };
  }
  
  res.status(200).json({
    success: true,
    message: 'Maintenance request updated successfully',
    data: { request: mockRequests[index] }
  });
});