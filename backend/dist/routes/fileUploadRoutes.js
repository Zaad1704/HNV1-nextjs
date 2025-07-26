"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const fileUploadController_1 = require("../controllers/fileUploadController");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/image', uploadMiddleware_1.default.single('image'), fileUploadController_1.uploadImage);
router.post('/upload', uploadMiddleware_1.default.single('file'), fileUploadController_1.uploadImage);
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'File upload service ready',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
