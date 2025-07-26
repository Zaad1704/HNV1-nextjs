import { Request, Response } from 'express';
import Property from '../models/Property';
import { catchAsync, CustomError } from '../middleware/errorHandler';

export const getProperties = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, search, type } = req.query;
  
  const query: any = { organization: req.user!.organization };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'address.street': { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (type) {
    query.type = type;
  }

  const properties = await Property.find(query)
    .populate('owner', 'firstName lastName email')
    .populate('manager', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Property.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const getProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const property = await Property.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  })
    .populate('owner', 'firstName lastName email')
    .populate('manager', 'firstName lastName email')
    .populate('units.tenant', 'firstName lastName email phone');

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { property }
  });
});

export const createProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const propertyData = {
    ...req.body,
    owner: req.user!._id,
    organization: req.user!.organization
  };

  const property = await Property.create(propertyData);

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: { property }
  });
});

export const updateProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const property = await Property.findOneAndUpdate(
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

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Property updated successfully',
    data: { property }
  });
});

export const deleteProperty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const property = await Property.findOneAndDelete({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});

export const addUnit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const property = await Property.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  property.units.push(req.body);
  await property.save();

  res.status(201).json({
    success: true,
    message: 'Unit added successfully',
    data: { property }
  });
});

export const updateUnit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const property = await Property.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  const unit = property.units.id(req.params.unitId);
  if (!unit) {
    throw new CustomError('Unit not found', 404);
  }

  Object.assign(unit, req.body);
  await property.save();

  res.status(200).json({
    success: true,
    message: 'Unit updated successfully',
    data: { property }
  });
});

export const deleteUnit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const property = await Property.findOne({
    _id: req.params.id,
    organization: req.user!.organization
  });

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  property.units.pull(req.params.unitId);
  await property.save();

  res.status(200).json({
    success: true,
    message: 'Unit deleted successfully'
  });
});