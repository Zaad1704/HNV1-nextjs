"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = exports.getDashboardMetrics = exports.getTenantRiskAnalysis = exports.getPropertyPerformance = exports.getCollectionTrends = exports.getCollectionAnalytics = void 0;
const getCollectionAnalytics = async (req, res) => {
    res.json({ success: true, data: { totalCollected: 25000, pending: 3000 } });
};
exports.getCollectionAnalytics = getCollectionAnalytics;
const getCollectionTrends = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.getCollectionTrends = getCollectionTrends;
const getPropertyPerformance = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.getPropertyPerformance = getPropertyPerformance;
const getTenantRiskAnalysis = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.getTenantRiskAnalysis = getTenantRiskAnalysis;
const getDashboardMetrics = async (req, res) => {
    res.json({
        success: true,
        data: {
            totalRevenue: 25000,
            totalProperties: 45,
            occupancyRate: 92,
            maintenanceRequests: 8
        }
    });
};
exports.getDashboardMetrics = getDashboardMetrics;
exports.getDashboard = exports.getDashboardMetrics;
