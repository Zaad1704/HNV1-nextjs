import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import { catchAsync, CustomError } from '../middleware/errorHandler';

export const getTenants = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, search, status, property } = req.query;
  
  const query: any = { organization: req.user!.organization };
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) {
    query.status = status;
  }
  
  if (property) {
    query.property = property;
  }

  const tenants = await Tenant.find(query)
    .populate('property', 'name address')
    .populate('unit')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Tenant.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      tenants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const getTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  })
    .populate('property', 'name address')
    .populate('unit')
    .populate('notes.createdBy', 'firstName lastName');

  if (!tenant) {
    throw new CustomError('Tenant not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { tenant }
  });
});

export const createTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenantData = {
    ...req.body,
    organization: req.user!.organization
  };

  // Validate property and unit exist
  const property = await Property.findOne({
    _id: tenantData.property,
    organization: req.user!.organization
  });

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  const unit = property.units.id(tenantData.unit);
  if (!unit) {
    throw new CustomError('Unit not found', 404);
  }

  if (unit.status === 'occupied') {
    throw new CustomError('Unit is already occupied', 400);
  }

  const tenant = await Tenant.create(tenantData);

  // Update unit status
  unit.status = 'occupied';
  unit.tenant = tenant._id;
  await property.save();

  res.status(201).json({
    success: true,
    message: 'Tenant created successfully',
    data: { tenant }
  });
});

export const updateTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenant = await Tenant.findOneAndUpdate(
    {
      _id: req.params.id,
      organization: req.user!.organization
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!tenant) {
    throw new CustomError('Tenant not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Tenant updated successfully',
    data: { tenant }
  });
});

export const deleteTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!tenant) {
    throw new CustomError('Tenant not found', 404);
  }

  // Update unit status to vacant
  const property = await Property.findById(tenant.property);
  if (property) {
    const unit = property.units.id(tenant.unit);
    if (unit) {
      unit.status = 'vacant';
      unit.tenant = undefined;
      await property.save();
    }
  }

  await tenant.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Tenant deleted successfully'
  });
});

export const addNote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!tenant) {
    throw new CustomError('Tenant not found', 404);
  }

  const note = {
    ...req.body,
    createdBy: req.user!._id
  };

  tenant.notes.push(note);
  await tenant.save();

  res.status(201).json({
    success: true,
    message: 'Note added successfully',
    data: { tenant }
  });
});

export const updateNote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!tenant) {
    throw new CustomError('Tenant not found', 404);
  }

  const note = tenant.notes.id(req.params.noteId);
  if (!note) {
    throw new CustomError('Note not found', 404);
  }

  Object.assign(note, req.body);
  await tenant.save();

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: { tenant }
  });
});

export const deleteNote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!tenant) {
    throw new CustomError('Tenant not found', 404);
  }

  tenant.notes.pull(req.params.noteId);
  await tenant.save();

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully'
  });
});