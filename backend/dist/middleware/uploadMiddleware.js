"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToMemory = exports.uploadToS3 = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const s3Service_1 = __importDefault(require("../services/s3Service"));
const fileFilter = (req, file, cb) => {
    try {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|webp|svg|bmp|tiff/;
        const allowedMimeTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        if (!file || !file.originalname || !file.mimetype) {
            console.log('Invalid file object:', file);
            return cb(new Error('Invalid file upload'));
        }
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.includes(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            console.log('File rejected:', { originalname: file.originalname, mimetype: file.mimetype, fieldname: file.fieldname });
            cb(new Error(`Invalid file type: ${file.mimetype}. Only images and documents are allowed.`));
        }
    }
    catch (error) {
        console.error('File filter error:', error);
        cb(new Error('File validation failed'));
    }
};
function getUploadFolder(fieldname) {
    switch (fieldname) {
        case 'logo':
        case 'image':
            return 'site-assets';
        case 'profile':
        case 'avatar':
            return 'profiles';
        case 'property':
            return 'properties';
        case 'tenantImage':
        case 'govtIdFront':
        case 'govtIdBack':
            return 'tenants';
        case 'document':
            return 'documents';
        default:
            return 'uploads';
    }
}
const diskStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        const uploadDir = path_1.default.join(__dirname, '../uploads/images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const memoryStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: diskStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 15,
        fields: 50
    },
    fileFilter: fileFilter
});
const uploadToMemory = (0, multer_1.default)({
    storage: memoryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 15,
        fields: 50
    },
    fileFilter: fileFilter
});
exports.uploadToMemory = uploadToMemory;
const uploadToS3 = async (file, fieldname) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path_1.default.extname(file.originalname);
    const folder = getUploadFolder(fieldname);
    const filename = `${folder}/${fieldname}-${uniqueSuffix}${extension}`;
    const url = await s3Service_1.default.uploadFile(filename, file.buffer, file.mimetype);
    return { url, filename };
};
exports.uploadToS3 = uploadToS3;
exports.default = upload;
