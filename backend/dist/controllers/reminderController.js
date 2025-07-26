"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReminder = exports.updateReminder = exports.createReminder = exports.getReminders = void 0;
const Reminder_1 = __importDefault(require("../models/Reminder"));
const getReminders = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { tenantId, propertyId, status } = req.query;
        const filter = { organizationId: req.user.organizationId };
        if (tenantId)
            filter.tenantId = tenantId;
        if (propertyId)
            filter.propertyId = propertyId;
        if (status)
            filter.status = status;
        const reminders = await Reminder_1.default.find(filter)
            .populate('tenantId', 'name email unit')
            .populate('propertyId', 'name address')
            .sort({ nextRunDate: 1 });
        res.json({ success: true, data: reminders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getReminders = getReminders;
const createReminder = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { tenantId, propertyId, type, message, nextRunDate, frequency } = req.body;
        if (!tenantId || !propertyId || !type || !nextRunDate || !frequency) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        const reminder = await Reminder_1.default.create({
            organizationId: req.user.organizationId,
            tenantId,
            propertyId,
            type,
            message: message || `${type.replace('_', ' ')} reminder`,
            nextRunDate: new Date(nextRunDate),
            frequency,
            status: 'active',
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: reminder });
    }
    catch (error) {
        console.error('Create reminder error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createReminder = createReminder;
const updateReminder = async (req, res) => {
    try {
        const reminder = await Reminder_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }
        res.json({ success: true, data: reminder });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateReminder = updateReminder;
const deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder_1.default.findByIdAndDelete(req.params.id);
        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }
        res.json({ success: true, message: 'Reminder deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteReminder = deleteReminder;
