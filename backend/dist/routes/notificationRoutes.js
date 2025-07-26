"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Notification_1 = __importDefault(require("../models/Notification"));
const router = (0, express_1.Router)();
router.patch('/mark-as-read/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const notification = await Notification_1.default.findOneAndUpdate({ _id: id, userId }, { isRead: true, readAt: new Date() }, { new: true });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.patch('/mark-all-read', authMiddleware_1.protect, async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification_1.default.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/chat-history', authMiddleware_1.protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const chatHistory = {
            messages: [],
            hasMore: false,
            total: 0
        };
        res.status(200).json({
            success: true,
            data: chatHistory,
            message: 'Chat history retrieved'
        });
    }
    catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/', authMiddleware_1.protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const notifications = await Notification_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Notification_1.default.countDocuments({ userId });
        const unreadCount = await Notification_1.default.countDocuments({ userId, isRead: false });
        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                unreadCount
            },
            message: 'Notifications retrieved'
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/', authMiddleware_1.protect, async (req, res) => {
    try {
        const { title, message, type, actionUrl } = req.body;
        const userId = req.user._id;
        const notification = new Notification_1.default({
            userId,
            title,
            message,
            type: type || 'info',
            actionUrl,
            isRead: false
        });
        await notification.save();
        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification created'
        });
    }
    catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
