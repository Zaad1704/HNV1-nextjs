import { Schema, model, Document } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  organizationId: Schema.Types.ObjectId;
  snapshotDate: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  metrics: {
    occupancy: {
      rate: number;
      totalUnits: number;
      occupiedUnits: number;
      vacantUnits: number;
    };
    revenue: {
      total: number;
      collected: number;
      outstanding: number;
      avgRentPerUnit: number;
    };
    tenants: {
      total: number;
      newTenants: number;
      leavingTenants: number;
      avgStayDuration: number;
    };
    properties: {
      total: number;
      avgOccupancyRate: number;
      topPerforming: Array<{
        propertyId: Schema.Types.ObjectId;
        propertyName: string;
        occupancyRate: number;
        revenue: number;
      }>;
    };
  };
  predictions: {
    nextPeriodOccupancy: number;
    nextPeriodRevenue: number;
    riskFactors: Array<{
      type: 'vacancy_risk' | 'payment_risk' | 'maintenance_risk';
      severity: 'low' | 'medium' | 'high';
      description: string;
      affectedUnits: number;
    }>;
  };
  trends: {
    occupancyTrend: 'increasing' | 'decreasing' | 'stable';
    revenueTrend: 'increasing' | 'decreasing' | 'stable';
    tenantTurnoverTrend: 'increasing' | 'decreasing' | 'stable';
  };
  createdAt: Date;
}

const AnalyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  snapshotDate: {
    type: Date,
    default: Date.now,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
  },
  metrics: {
    occupancy: {
      rate: { type: Number, default: 0 },
      totalUnits: { type: Number, default: 0 },
      occupiedUnits: { type: Number, default: 0 },
      vacantUnits: { type: Number, default: 0 },
    },
    revenue: {
      total: { type: Number, default: 0 },
      collected: { type: Number, default: 0 },
      outstanding: { type: Number, default: 0 },
      avgRentPerUnit: { type: Number, default: 0 },
    },
    tenants: {
      total: { type: Number, default: 0 },
      newTenants: { type: Number, default: 0 },
      leavingTenants: { type: Number, default: 0 },
      avgStayDuration: { type: Number, default: 0 },
    },
    properties: {
      total: { type: Number, default: 0 },
      avgOccupancyRate: { type: Number, default: 0 },
      topPerforming: [{
        propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
        propertyName: { type: String },
        occupancyRate: { type: Number },
        revenue: { type: Number },
      }],
    },
  },
  predictions: {
    nextPeriodOccupancy: { type: Number, default: 0 },
    nextPeriodRevenue: { type: Number, default: 0 },
    riskFactors: [{
      type: {
        type: String,
        enum: ['vacancy_risk', 'payment_risk', 'maintenance_risk'],
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      description: { type: String },
      affectedUnits: { type: Number, default: 0 },
    }],
  },
  trends: {
    occupancyTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable',
    },
    revenueTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable',
    },
    tenantTurnoverTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable',
    },
  },
}, { timestamps: true });

// Indexes for efficient queries
AnalyticsSnapshotSchema.index({ organizationId: 1, snapshotDate: -1 });
AnalyticsSnapshotSchema.index({ organizationId: 1, period: 1, snapshotDate: -1 });

export default model<IAnalyticsSnapshot>('AnalyticsSnapshot', AnalyticsSnapshotSchema);