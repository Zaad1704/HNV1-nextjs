"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadedFiles = exports.testUpload = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const testUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            data: {
                url: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            message: 'File uploaded successfully'
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed'
        });
    }
};
exports.testUpload = testUpload;
const getUploadedFiles = async (req, res) => {
    try {
        const uploadsDir = path_1.default.join(process.cwd(), 'backend', 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            return res.json({ success: true, data: [] });
        }
        const files = fs_1.default.readdirSync(uploadsDir).map(filename => ({
            filename,
            url: `/uploads/${filename}`,
            size: fs_1.default.statSync(path_1.default.join(uploadsDir, filename)).size
        }));
        res.json({ success: true, data: files });
    }
    catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get files'
        });
    }
};
exports.getUploadedFiles = getUploadedFiles;
