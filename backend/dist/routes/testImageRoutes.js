"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/upload', uploadMiddleware_1.default.single('image'), (req, res) => {
    try {
        console.log('Test image upload:', {
            file: req.file,
            body: req.body
        });
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
            }
        });
    }
    catch (error) {
        console.error('Test image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});
router.get('/files', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    try {
        const uploadsDir = path.join(__dirname, '../uploads');
        const files = fs.readdirSync(uploadsDir);
        res.json({
            success: true,
            files: files.map(file => ({
                name: file,
                url: `/uploads/${file}`,
                fullUrl: `${req.protocol}://${req.get('host')}/uploads/${file}`
            }))
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to list files',
            error: error.message
        });
    }
});
exports.default = router;
