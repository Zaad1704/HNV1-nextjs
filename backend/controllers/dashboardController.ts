import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import { catchAsync } from '../middleware/errorHandler';

export const getDashboardStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const orgId = req.user!.organization;

  // Get basic counts
  const [totalProperties, totalTenants, activeTenants, vacantUnits] = await Promise.all([
    Property.countDocuments({ organization: orgId, isActive: true }),
    Tenant.countDocuments({ organization: orgId }),
    Tenant.countDocuments({ organization: orgId, status: 'active' }),
    Property.aggregate([
      { $match: { organization: orgId, isActive: true } },
      { $unwind: '$units' },
      { $match: { 'units.status': 'vacant' } },
      { $count: 'vacant' }
    ])
  ]);

  // Get financial data
  const properties = await Property.find({ organization: orgId, isActive: true });
  
  let totalRent = 0;
  let totalUnits = 0;
  let occupiedUnits = 0;

  properties.forEach(property => {
    totalUnits += property.units.length;
    property.units.forEach(unit => {
      totalRent += unit.rent;
      if (unit.status === 'occupied') {
        occupiedUnits++;
      }
    });
  });

  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const monthlyRevenue = totalRent;
  const yearlyRevenue = totalRent * 12;

  // Get recent tenants
  const recentTenants = await Tenant.find({ organization: orgId })
    .populate('property', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName email status createdAt property');

  // Get properties with low occupancy
  const propertiesWithOccupancy = await Property.aggregate([
    { $match: { organization: orgId, isActive: true } },
    {
      $addFields: {
        totalUnits: { $size: '$units' },
        occupiedUnits: {
          $size: {
            $filter: {
              input: '$units',
              cond: { $eq: ['$$this.status', 'occupied'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        occupancyRate: {
          $cond: {
            if: { $gt: ['$totalUnits', 0] },
            then: { $multiply: [{ $divide: ['$occupiedUnits', '$totalUnits'] }, 100] },
            else: 0
          }
        }
      }
    },
    { $match: { occupancyRate: { $lt: 80 } } },
    { $sort: { occupancyRate: 1 } },
    { $limit: 5 },
    { $project: { name: 1, occupancyRate: 1, totalUnits: 1, occupiedUnits: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalProperties,
        totalTenants,
        activeTenants,
        vacantUnits: vacantUnits[0]?.vacant || 0,
        occupancyRate,
        monthlyRevenue,
        yearlyRevenue
      },
      recentTenants,
      lowOccupancyProperties: propertiesWithOccupancy,
      alerts: [
        ...(occupancyRate < 70 ? [{ type: 'warning', message: 'Overall occupancy rate is below 70%' }] : []),
        ...(vacantUnits[0]?.vacant > 5 ? [{ type: 'info', message: `${vacantUnits[0].vacant} units are currently vacant` }] : [])
      ]
    }
  });
});

export const getFinancialSummary = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const orgId = req.user!.organization;
  const { period = 'month' } = req.query;

  const properties = await Property.find({ organization: orgId, isActive: true });
  
  let totalRent = 0;
  let totalDeposit = 0;
  let occupiedUnits = 0;
  let totalUnits = 0;

  const propertyFinancials = properties.map(property => {
    let propertyRent = 0;
    let propertyDeposit = 0;
    let propertyOccupied = 0;

    property.units.forEach(unit => {
      propertyRent += unit.rent;
      propertyDeposit += unit.deposit;
      totalUnits++;
      
      if (unit.status === 'occupied') {
        occupiedUnits++;
        propertyOccupied++;
      }
    });

    totalRent += propertyRent;
    totalDeposit += propertyDeposit;

    return {
      propertyId: property._id,
      propertyName: property.name,
      monthlyRent: propertyRent,
      totalDeposit: propertyDeposit,
      occupiedUnits: propertyOccupied,
      totalUnits: property.units.length,
      occupancyRate: property.units.length > 0 ? Math.round((propertyOccupied / property.units.length) * 100) : 0
    };
  });

  const multiplier = period === 'year' ? 12 : 1;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalMonthlyRent: totalRent,
        totalRevenue: totalRent * multiplier,
        totalDeposits: totalDeposit,
        occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
        totalProperties: properties.length,
        totalUnits,
        occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits
      },
      propertyBreakdown: propertyFinancials,
      period
    }
  });
});

export const getOccupancyTrends = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const orgId = req.user!.organization;

  // Get current occupancy by property type
  const occupancyByType = await Property.aggregate([
    { $match: { organization: orgId, isActive: true } },
    {
      $addFields: {
        totalUnits: { $size: '$units' },
        occupiedUnits: {
          $size: {
            $filter: {
              input: '$units',
              cond: { $eq: ['$$this.status', 'occupied'] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: '$type',
        totalUnits: { $sum: '$totalUnits' },
        occupiedUnits: { $sum: '$occupiedUnits' },
        properties: { $sum: 1 }
      }
    },
    {
      $addFields: {
        occupancyRate: {
          $cond: {
            if: { $gt: ['$totalUnits', 0] },
            then: { $multiply: [{ $divide: ['$occupiedUnits', '$totalUnits'] }, 100] },
            else: 0
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      occupancyByType,
      totalProperties: await Property.countDocuments({ organization: orgId, isActive: true }),
      totalTenants: await Tenant.countDocuments({ organization: orgId, status: 'active' })
    }
  });
});