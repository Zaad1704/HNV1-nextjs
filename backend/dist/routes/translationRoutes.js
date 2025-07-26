"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const translationController_1 = require("../controllers/translationController");
const translationService_1 = __importDefault(require("../services/translationService"));
const router = (0, express_1.Router)();
router.get('/languages', translationController_1.getSupportedLanguages);
router.post('/detect', translationController_1.detectLanguage);
router.post('/translate', translationController_1.translateContent);
router.post('/translate/bulk', translationController_1.translateBulk);
router.get('/:language', async (req, res) => {
    try {
        const { language } = req.params;
        const translations = await translationService_1.default.getTranslations(language);
        res.status(200).json({
            success: true,
            data: translations
        });
    }
    catch (error) {
        console.error('Get translations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/auto-detect', async (req, res) => {
    try {
        const detectedLanguage = await translationService_1.default.detectUserLanguage(req);
        res.status(200).json({
            success: true,
            data: { detectedLanguage }
        });
    }
    catch (error) {
        console.error('Auto-detect language error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.use(authMiddleware_1.protect);
router.put('/:language/:key', async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const { language, key } = req.params;
        const { value } = req.body;
        const result = await translationService_1.default.updateTranslation(language, key, value);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Translation updated successfully'
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: result.error || 'Failed to update translation'
            });
        }
    }
    catch (error) {
        console.error('Update translation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/user/preference', translationController_1.getUserLanguagePreference);
router.post('/user/preference', translationController_1.setUserLanguagePreference);
exports.default = router;
