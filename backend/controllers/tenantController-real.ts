import { Request, Response } from 'express';
import { catchAsync } from '../middleware/errorHandler';

const mockTenants = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-0101',
    status: 'active',
    property: { _id: '1', name: 'Sunset Apartments' },
    lease: { startDate: new Date(), endDate: new Date(Date.now() + 365*24*60*60*1000), rent: 1200 }
  },
  {
    _id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '555-0102',
    status: 'active',
    property: { _id: '2', name: 'Downtown Lofts' },
    lease: { startDate: new Date(), endDate: new Date(Date.now() + 365*24*60*60*1000), rent: 1800 }
  }
];

export const getTenants = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      tenants: mockTenants,
      pagination: { page: 1, limit: 10, total: mockTenants.length, pages: 1 }
    }
  });
});

export const createTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const newTenant = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'active'
  };
  mockTenants.push(newTenant);
  
  res.status(201).json({
    success: true,
    message: 'Tenant created successfully',
    data: { tenant: newTenant }
  });
});

export const getTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenant = mockTenants.find(t => t._id === req.params.id);
  
  res.status(200).json({
    success: true,
    data: { tenant }
  });
});

export const updateTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockTenants.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    mockTenants[index] = { ...mockTenants[index], ...req.body };
  }
  
  res.status(200).json({
    success: true,
    message: 'Tenant updated successfully',
    data: { tenant: mockTenants[index] }
  });
});

export const deleteTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const index = mockTenants.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    mockTenants.splice(index, 1);
  }
  
  res.status(200).json({
    success: true,
    message: 'Tenant deleted successfully'
  });
});