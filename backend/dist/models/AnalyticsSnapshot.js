"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AnalyticsSnapshotSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' },
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
AnalyticsSnapshotSchema.index({ organizationId: 1, snapshotDate: -1 });
AnalyticsSnapshotSchema.index({ organizationId: 1, period: 1, snapshotDate: -1 });
exports.default = (0, mongoose_1.model)('AnalyticsSnapshot', AnalyticsSnapshotSchema);
