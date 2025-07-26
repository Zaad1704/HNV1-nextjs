import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

const mockProperties = [
  {
    _id: '1',
    name: 'Sunset Apartments',
    address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001' },
    type: 'apartment',
    units: [
      { _id: '1a', number: '101', status: 'occupied', rent: 1200 },
      { _id: '1b', number: '102', status: 'vacant', rent: 1200 }
    ]
  },
  {
    _id: '2',
    name: 'Downtown Lofts',
    address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90210' },
    type: 'loft',
    units: [
      { _id: '2a', number: '201', status: 'occupied', rent: 1800 }
    ]
  }
];

export const getProperties = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      properties: mockProperties,
      pagination: { page: 1, limit: 10, total: mockProperties.length, pages: 1 }
    }
  });
});

export const createProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const newProperty = {
    _id: Date.now().toString(),
    ...req.body,
    units: []
  };
  mockProperties.push(newProperty);
  
  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: { property: newProperty }
  });
});

export const getProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const property = mockProperties.find(p => p._id === req.params.id);
  
  res.status(200).json({
    success: true,
    data: { property }
  });
});

export const updateProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockProperties.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    mockProperties[index] = { ...mockProperties[index], ...req.body };
  }
  
  res.status(200).json({
    success: true,
    message: 'Property updated successfully',
    data: { property: mockProperties[index] }
  });
});

export const deleteProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockProperties.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    mockProperties.splice(index, 1);
  }
  
  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});