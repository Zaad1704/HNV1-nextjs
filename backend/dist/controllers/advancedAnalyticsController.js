"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPredictiveInsights = exports.getTrendAnalysis = exports.getPropertyPerformance = exports.getDashboardAnalytics = exports.generateAnalyticsSnapshot = void 0;
const AnalyticsSnapshot_1 = __importDefault(require("../models/AnalyticsSnapshot"));
const Unit_1 = __importDefault(require("../models/Unit"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Property_1 = __importDefault(require("../models/Property"));
const Payment_1 = __importDefault(require("../models/Payment"));
const generateAnalyticsSnapshot = async (req, res) => {
    try {
        const { period = 'monthly' } = req.body;
        const organizationId = req.user?.organizationId;
        const snapshot = await createAnalyticsSnapshot(organizationId, period);
        res.json({ success: true, data: snapshot });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate analytics snapshot' });
    }
};
exports.generateAnalyticsSnapshot = generateAnalyticsSnapshot;
const getDashboardAnalytics = async (req, res) => {
    try {
        const organizationId = req.user?.organizationId;
        const { timeframe = '30' } = req.query;
        const [currentMetrics, historicalData, predictions, benchmarks] = await Promise.all([
            getCurrentMetrics(organizationId),
            getHistoricalData(organizationId, Number(timeframe)),
            generatePredictions(organizationId),
            getBenchmarkData(organizationId)
        ]);
        res.json({
            success: true,
            data: {
                current: currentMetrics,
                historical: historicalData,
                predictions,
                benchmarks,
                insights: generateInsights(currentMetrics, historicalData)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard analytics' });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const getPropertyPerformance = async (req, res) => {
    try {
        const organizationId = req.user?.organizationId;
        const { metric = 'occupancy' } = req.query;
        const properties = await Property_1.default.find({ organizationId });
        const performance = [];
        for (const property of properties) {
            const units = await Unit_1.default.find({ propertyId: property._id });
            const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
            const occupancyRate = units.length > 0 ? (occupiedUnits / units.length) * 100 : 0;
            const totalRevenue = await Payment_1.default.aggregate([
                { $match: { propertyId: property._id, organizationId } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const avgStayDuration = units.reduce((sum, unit) => sum + (unit.historyTracking?.averageStayDuration || 0), 0) / units.length;
            performance.push({
                propertyId: property._id,
                propertyName: property.name,
                occupancyRate,
                totalRevenue: totalRevenue[0]?.total || 0,
                avgStayDuration,
                totalUnits: units.length,
                occupiedUnits,
                score: calculatePropertyScore(occupancyRate, totalRevenue[0]?.total || 0, avgStayDuration)
            });
        }
        performance.sort((a, b) => {
            switch (metric) {
                case 'revenue': return b.totalRevenue - a.totalRevenue;
                case 'occupancy': return b.occupancyRate - a.occupancyRate;
                case 'score': return b.score - a.score;
                default: return b.occupancyRate - a.occupancyRate;
            }
        });
        res.json({ success: true, data: performance });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch property performance' });
    }
};
exports.getPropertyPerformance = getPropertyPerformance;
const getTrendAnalysis = async (req, res) => {
    try {
        const organizationId = req.user?.organizationId;
        const { period = 'monthly', months = 12 } = req.query;
        const snapshots = await AnalyticsSnapshot_1.default.find({
            organizationId,
            period,
            snapshotDate: {
                $gte: new Date(Date.now() - Number(months) * 30 * 24 * 60 * 60 * 1000)
            }
        }).sort({ snapshotDate: 1 });
        const trends = {
            occupancy: snapshots.map(s => ({
                date: s.snapshotDate,
                value: s.metrics.occupancy.rate
            })),
            revenue: snapshots.map(s => ({
                date: s.snapshotDate,
                value: s.metrics.revenue.total
            })),
            tenantTurnover: snapshots.map(s => ({
                date: s.snapshotDate,
                value: s.metrics.tenants.leavingTenants
            }))
        };
        res.json({ success: true, data: trends });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch trend analysis' });
    }
};
exports.getTrendAnalysis = getTrendAnalysis;
const getPredictiveInsights = async (req, res) => {
    try {
        const organizationId = req.user?.organizationId;
        const [vacancyRisks, paymentRisks, maintenanceRisks, marketTrends] = await Promise.all([
            analyzeVacancyRisk(organizationId),
            analyzePaymentRisk(organizationId),
            analyzeMaintenanceRisk(organizationId),
            analyzeMarketTrends(organizationId)
        ]);
        const insights = {
            risks: {
                vacancy: vacancyRisks,
                payment: paymentRisks,
                maintenance: maintenanceRisks
            },
            opportunities: generateOpportunities(vacancyRisks, paymentRisks),
            recommendations: generateRecommendations(vacancyRisks, paymentRisks, maintenanceRisks),
            marketTrends
        };
        res.json({ success: true, data: insights });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch predictive insights' });
    }
};
exports.getPredictiveInsights = getPredictiveInsights;
async function createAnalyticsSnapshot(organizationId, period) {
    const [units, tenants, properties, payments] = await Promise.all([
        Unit_1.default.find({ organizationId }),
        Tenant_1.default.find({ organizationId }),
        Property_1.default.find({ organizationId }),
        Payment_1.default.find({ organizationId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);
    const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
    const occupancyRate = units.length > 0 ? (occupiedUnits / units.length) * 100 : 0;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const avgRent = tenants.length > 0 ? tenants.reduce((sum, t) => sum + t.rentAmount, 0) / tenants.length : 0;
    const snapshot = new AnalyticsSnapshot_1.default({
        organizationId,
        period,
        metrics: {
            occupancy: {
                rate: occupancyRate,
                totalUnits: units.length,
                occupiedUnits,
                vacantUnits: units.length - occupiedUnits
            },
            revenue: {
                total: totalRevenue,
                collected: totalRevenue,
                outstanding: 0,
                avgRentPerUnit: avgRent
            },
            tenants: {
                total: tenants.length,
                newTenants: tenants.filter(t => new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
                leavingTenants: 0,
                avgStayDuration: units.reduce((sum, u) => sum + (u.historyTracking?.averageStayDuration || 0), 0) / units.length
            },
            properties: {
                total: properties.length,
                avgOccupancyRate: occupancyRate,
                topPerforming: []
            }
        },
        predictions: {
            nextPeriodOccupancy: occupancyRate * 1.02,
            nextPeriodRevenue: totalRevenue * 1.05,
            riskFactors: []
        },
        trends: {
            occupancyTrend: 'stable',
            revenueTrend: 'increasing',
            tenantTurnoverTrend: 'stable'
        }
    });
    await snapshot.save();
    return snapshot;
}
async function getCurrentMetrics(organizationId) {
    const [units, tenants, payments] = await Promise.all([
        Unit_1.default.find({ organizationId }),
        Tenant_1.default.find({ organizationId, status: 'Active' }),
        Payment_1.default.find({ organizationId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);
    const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    return {
        occupancyRate: units.length > 0 ? (occupiedUnits / units.length) * 100 : 0,
        totalUnits: units.length,
        totalTenants: tenants.length,
        monthlyRevenue: totalRevenue,
        avgRent: tenants.length > 0 ? tenants.reduce((sum, t) => sum + t.rentAmount, 0) / tenants.length : 0
    };
}
async function getHistoricalData(organizationId, days) {
    return await AnalyticsSnapshot_1.default.find({
        organizationId,
        snapshotDate: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ snapshotDate: 1 });
}
async function generatePredictions(organizationId) {
    const currentMetrics = await getCurrentMetrics(organizationId);
    return {
        nextMonthOccupancy: currentMetrics.occupancyRate * 1.02,
        nextMonthRevenue: currentMetrics.monthlyRevenue * 1.05,
        confidence: 0.85
    };
}
async function getBenchmarkData(organizationId) {
    return {
        industryAvgOccupancy: 92,
        industryAvgRent: 1200,
        marketTrend: 'increasing'
    };
}
function generateInsights(current, historical) {
    return [
        {
            type: 'occupancy',
            message: `Occupancy rate is ${current.occupancyRate.toFixed(1)}%`,
            trend: current.occupancyRate > 90 ? 'positive' : 'neutral'
        },
        {
            type: 'revenue',
            message: `Monthly revenue: $${current.monthlyRevenue.toLocaleString()}`,
            trend: 'positive'
        }
    ];
}
function calculatePropertyScore(occupancy, revenue, avgStay) {
    return (occupancy * 0.4) + (Math.min(revenue / 10000, 100) * 0.4) + (Math.min(avgStay, 24) * 0.2);
}
async function analyzeVacancyRisk(organizationId) {
    const units = await Unit_1.default.find({ organizationId, status: 'Available' });
    return {
        highRiskUnits: units.length,
        totalRisk: units.length > 5 ? 'high' : 'low'
    };
}
async function analyzePaymentRisk(organizationId) {
    const lateTenants = await Tenant_1.default.find({ organizationId, status: 'Late' });
    return {
        latePayments: lateTenants.length,
        totalRisk: lateTenants.length > 3 ? 'high' : 'low'
    };
}
async function analyzeMaintenanceRisk(organizationId) {
    const maintenanceUnits = await Unit_1.default.find({ organizationId, status: 'Maintenance' });
    return {
        unitsInMaintenance: maintenanceUnits.length,
        totalRisk: maintenanceUnits.length > 2 ? 'medium' : 'low'
    };
}
async function analyzeMarketTrends(organizationId) {
    return {
        rentTrend: 'increasing',
        demandTrend: 'stable',
        competitionLevel: 'medium'
    };
}
function generateOpportunities(vacancyRisk, paymentRisk) {
    return [
        { type: 'rent_optimization', description: 'Consider rent adjustments for vacant units' },
        { type: 'tenant_retention', description: 'Implement tenant retention programs' }
    ];
}
function generateRecommendations(vacancyRisk, paymentRisk, maintenanceRisk) {
    return [
        { priority: 'high', action: 'Address vacant units with competitive pricing' },
        { priority: 'medium', action: 'Implement automated payment reminders' }
    ];
}
