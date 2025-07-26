"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTenantImageUpload = exports.handleDocumentUpload = exports.handleImageUpload = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
exports.uploadImage = upload.single('image');
const handleImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        let imageUrl;
        try {
            const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
            if (isCloudinaryConfigured()) {
                imageUrl = await uploadToCloudinary(req.file, 'uploads');
            }
            else {
                imageUrl = `/uploads/${req.file.filename}`;
            }
        }
        catch (error) {
            console.error('Cloudinary upload failed, using local:', error);
            imageUrl = `/uploads/${req.file.filename}`;
        }
        res.json({
            success: true,
            data: {
                url: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    }
    catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};
exports.handleImageUpload = handleImageUpload;
const handleDocumentUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { tenantId, description } = req.body;
        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Tenant ID required' });
        }
        let documentUrl;
        try {
            const s3Service = await Promise.resolve().then(() => __importStar(require('../services/s3Service')));
            const filename = `documents/${Date.now()}-${req.file.originalname}`;
            documentUrl = await s3Service.default.uploadFile(filename, req.file.buffer, req.file.mimetype);
        }
        catch (error) {
            console.error('S3 upload failed, using local:', error);
            documentUrl = `/uploads/${req.file.filename}`;
        }
        const Tenant = await Promise.resolve().then(() => __importStar(require('../models/Tenant')));
        await Tenant.default.findByIdAndUpdate(tenantId, {
            $push: {
                documents: {
                    url: documentUrl,
                    filename: req.file.originalname,
                    description: description || 'Document',
                    uploadedAt: new Date()
                }
            }
        });
        res.json({
            success: true,
            data: {
                url: documentUrl,
                filename: req.file.originalname,
                description
            }
        });
    }
    catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};
exports.handleDocumentUpload = handleDocumentUpload;
const handleTenantImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { tenantId, description } = req.body;
        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Tenant ID required' });
        }
        let imageUrl;
        try {
            const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
            if (isCloudinaryConfigured()) {
                imageUrl = await uploadToCloudinary(req.file, 'tenant-uploads');
            }
            else {
                imageUrl = `/uploads/${req.file.filename}`;
            }
        }
        catch (error) {
            console.error('Cloudinary upload failed, using local:', error);
            imageUrl = `/uploads/${req.file.filename}`;
        }
        const Tenant = await Promise.resolve().then(() => __importStar(require('../models/Tenant')));
        await Tenant.default.findByIdAndUpdate(tenantId, {
            $push: {
                uploadedImages: {
                    url: imageUrl,
                    description: description || 'Image',
                    uploadedAt: new Date()
                }
            }
        });
        res.json({
            success: true,
            data: {
                url: imageUrl,
                description
            }
        });
    }
    catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};
exports.handleTenantImageUpload = handleTenantImageUpload;
