"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanById = exports.getPlans = void 0;
const Plan_1 = __importDefault(require("../models/Plan"));
const getPlans = async (req, res) => {
    try {
        const plans = await Plan_1.default.find({ isActive: true });
        res.json({ success: true, data: plans });
    }
    catch (error) {
        res.json({ success: true, data: [] });
    }
};
exports.getPlans = getPlans;
const getPlanById = async (req, res) => {
    try {
        const plan = await Plan_1.default.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(404).json({ success: false, message: 'Plan not found' });
    }
};
exports.getPlanById = getPlanById;
