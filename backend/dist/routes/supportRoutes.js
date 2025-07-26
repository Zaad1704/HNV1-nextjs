"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/chat-history', authMiddleware_1.protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const chatHistory = {
            messages: [
                {
                    id: '1',
                    text: 'Hello! How can we help you today?',
                    sender: 'admin',
                    timestamp: new Date(),
                    senderName: 'Support Team',
                    senderRole: 'Super Admin'
                }
            ],
            hasMore: false,
            total: 1
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
router.post('/send-message', authMiddleware_1.protect, async (req, res) => {
    try {
        const { message, userId, userName, userRole } = req.body;
        console.log('Message received:', { message, userId, userName, userRole });
        res.status(200).json({
            success: true,
            message: 'Message sent successfully'
        });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
