"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteSettingsController_1 = require("../controllers/siteSettingsController");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.get('/', siteSettingsController_1.getSiteSettings);
router.use(authMiddleware_1.protect);
router.put('/', (0, authMiddleware_1.authorize)('Super Admin'), siteSettingsController_1.updateSiteSettings);
router.post('/upload-logo', (0, authMiddleware_1.authorize)('Super Admin'), uploadMiddleware_1.default.single('logo'), siteSettingsController_1.uploadSiteLogo);
router.post('/upload-image', (0, authMiddleware_1.authorize)('Super Admin'), uploadMiddleware_1.default.single('image'), siteSettingsController_1.uploadLandingImage);
exports.default = router;
