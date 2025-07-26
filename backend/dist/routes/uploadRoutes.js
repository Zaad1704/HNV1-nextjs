"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadController_1 = require("../controllers/uploadController");
const testUploadController_1 = require("../controllers/testUploadController");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/image', uploadMiddleware_1.default.single('image'), uploadController_1.handleImageUpload);
router.post('/file', uploadMiddleware_1.default.single('file'), uploadController_1.handleImageUpload);
router.post('/document', uploadMiddleware_1.default.single('document'), uploadController_1.handleDocumentUpload);
router.post('/tenant-image', uploadMiddleware_1.default.single('image'), uploadController_1.handleTenantImageUpload);
router.post('/test', uploadMiddleware_1.default.single('image'), testUploadController_1.testUpload);
router.get('/files', testUploadController_1.getUploadedFiles);
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Upload service ready',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
