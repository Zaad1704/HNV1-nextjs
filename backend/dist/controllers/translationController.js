"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserLanguagePreference = exports.getUserLanguagePreference = exports.translateBulk = exports.getSupportedLanguages = exports.detectLanguage = exports.translateContent = void 0;
const translationService_1 = __importDefault(require("../services/translationService"));
const translateContent = async (req, res, next) => {
    try {
        const { text, targetLanguage, sourceLanguage } = req.body;
        if (!text || !targetLanguage) {
            return res.status(400).json({
                success: false,
                message: 'Text and targetLanguage are required.'
            });
        }
        const translatedText = await translationService_1.default.translateText(text, targetLanguage, sourceLanguage);
        res.status(200).json({
            success: true,
            data: {
                originalText: text,
                translatedText,
                sourceLanguage: sourceLanguage || 'auto',
                targetLanguage
            }
        });
    }
    catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to translate content.'
        });
    }
};
exports.translateContent = translateContent;
const detectLanguage = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required for language detection.'
            });
        }
        const detectedLanguage = await translationService_1.default.detectLanguage(text);
        res.status(200).json({
            success: true,
            data: {
                text,
                detectedLanguage,
                confidence: detectedLanguage.confidence || 1
            }
        });
    }
    catch (error) {
        console.error('Language detection error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to detect language.'
        });
    }
};
exports.detectLanguage = detectLanguage;
const getSupportedLanguages = async (req, res, next) => {
    try {
        const languages = translationService_1.default.getSupportedLanguages();
        res.status(200).json({
            success: true,
            data: {
                languages,
                total: languages.length
            }
        });
    }
    catch (error) {
        console.error('Get supported languages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get supported languages.'
        });
    }
};
exports.getSupportedLanguages = getSupportedLanguages;
const translateBulk = async (req, res, next) => {
    try {
        const { texts, targetLanguage, sourceLanguage } = req.body;
        if (!texts || !Array.isArray(texts) || !targetLanguage) {
            return res.status(400).json({
                success: false,
                message: 'Texts array and targetLanguage are required.'
            });
        }
        const translations = await Promise.all(texts.map(text => translationService_1.default.translateText(text, targetLanguage, sourceLanguage)));
        res.status(200).json({
            success: true,
            data: {
                originalTexts: texts,
                translations,
                sourceLanguage: sourceLanguage || 'auto',
                targetLanguage
            }
        });
    }
    catch (error) {
        console.error('Bulk translation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to translate texts.'
        });
    }
};
exports.translateBulk = translateBulk;
const getUserLanguagePreference = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const preference = await translationService_1.default.getUserLanguagePreference(userId);
        res.status(200).json({
            success: true,
            data: preference
        });
    }
    catch (error) {
        console.error('Get user language preference error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get language preference.'
        });
    }
};
exports.getUserLanguagePreference = getUserLanguagePreference;
const setUserLanguagePreference = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { language } = req.body;
        if (!language) {
            return res.status(400).json({
                success: false,
                message: 'Language is required.'
            });
        }
        await translationService_1.default.setUserLanguagePreference(userId, language);
        res.status(200).json({
            success: true,
            message: 'Language preference updated successfully.',
            data: { language }
        });
    }
    catch (error) {
        console.error('Set user language preference error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set language preference.'
        });
    }
};
exports.setUserLanguagePreference = setUserLanguagePreference;
