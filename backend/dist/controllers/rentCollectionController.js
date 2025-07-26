"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSheet = exports.createAction = exports.getActions = exports.generatePeriod = exports.getPeriod = exports.getOverdue = exports.getAnalytics = void 0;
const getAnalytics = async (req, res) => {
    res.json({
        success: true,
        data: {
            totalCollected: 15000,
            pendingAmount: 3000,
            overdueAmount: 1200
        }
    });
};
exports.getAnalytics = getAnalytics;
const getOverdue = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.getOverdue = getOverdue;
const getPeriod = async (req, res) => {
    res.json({ success: true, data: {} });
};
exports.getPeriod = getPeriod;
const generatePeriod = async (req, res) => {
    res.json({ success: true, data: { id: 'period_123' } });
};
exports.generatePeriod = generatePeriod;
const getActions = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.getActions = getActions;
const createAction = async (req, res) => {
    res.json({ success: true, data: { id: 'action_123' } });
};
exports.createAction = createAction;
const createSheet = async (req, res) => {
    res.json({ success: true, data: { id: 'sheet_123' } });
};
exports.createSheet = createSheet;
