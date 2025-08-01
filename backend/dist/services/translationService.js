"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
class TranslationService {
    constructor() {
        this.supportedLanguages = [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'fr', name: 'French', nativeName: 'Français' },
            { code: 'de', name: 'German', nativeName: 'Deutsch' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano' },
            { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский' },
            { code: 'zh', name: 'Chinese', nativeName: '中文' },
            { code: 'ja', name: 'Japanese', nativeName: '日本語' },
            { code: 'ko', name: 'Korean', nativeName: '한국어' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
            { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
            { code: 'th', name: 'Thai', nativeName: 'ไทย' },
            { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
            { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
            { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
            { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
            { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
            { code: 'da', name: 'Danish', nativeName: 'Dansk' },
            { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
            { code: 'pl', name: 'Polish', nativeName: 'Polski' },
            { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
            { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
            { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
            { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
            { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
            { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
            { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
            { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
            { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
            { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
            { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
            { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' }
        ];
    }
    async detectLanguage(text) {
        try {
            if (/[\u4e00-\u9fff]/.test(text)) {
                return { language: 'zh', confidence: 0.9 };
            }
            if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
                return { language: 'ja', confidence: 0.9 };
            }
            if (/[\uac00-\ud7af]/.test(text)) {
                return { language: 'ko', confidence: 0.9 };
            }
            if (/[\u0600-\u06ff]/.test(text)) {
                return { language: 'ar', confidence: 0.9 };
            }
            if (/[\u0900-\u097f]/.test(text)) {
                return { language: 'hi', confidence: 0.9 };
            }
            if (/[\u0e00-\u0e7f]/.test(text)) {
                return { language: 'th', confidence: 0.9 };
            }
            if (/[\u0400-\u04ff]/.test(text)) {
                return { language: 'ru', confidence: 0.8 };
            }
            const lowerText = text.toLowerCase();
            if (/\b(el|la|de|en|y|a|que|es|se|no|te|lo|le|da|su|por|son|con|para|una|sur|también|hasta|hay|donde|quien|desde|todo|nos|durante|todos|uno|les|ni|contra|otros|ese|eso|ante|ellos|e|esto|mí|antes|algunos|qué|unos|yo|otro|otras|otra|él|tanto|esa|estos|mucho|quienes|nada|muchos|cual|poco|ella|estar|estas|algunas|algo|nosotros|mi|mis|tú|te|ti|tu|tus|ellas|nosotras|vosotros|vosotras)\b/.test(lowerText)) {
                return { language: 'es', confidence: 0.7 };
            }
            if (/\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|pouvoir|par|je|su|te|mais|du|bon|être|faire|son|tout|aller|vous|tous|sa|comme|moi|faire|ses|eux|aussi|bien|où|sans|peut|elle|si|tout|nous|ou|très|me|même|y|ces|lui|temps|été|personne|non|grand|monde|année|jour|monsieur|homme|bien|nouveau|compte|service|contre|premier|vers|conditions|prix|fois|pays|question|moins|donner|type|moment|enfant|point|mot|plusieurs|entre|vouloir|dire|rendre|quel|quelque)\b/.test(lowerText)) {
                return { language: 'fr', confidence: 0.7 };
            }
            if (/\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|einer|um|am|sind|noch|wie|einem|über|einen|so|zum|war|haben|nur|oder|aber|vor|zur|bis|unter|während|des)\b/.test(lowerText)) {
                return { language: 'de', confidence: 0.7 };
            }
            return { language: 'en', confidence: 0.5 };
        }
        catch (error) {
            console.error('Language detection error:', error);
            return { language: 'en', confidence: 0.1 };
        }
    }
    async translateText(text, targetLanguage, sourceLanguage) {
        try {
            if (!sourceLanguage) {
                const detected = await this.detectLanguage(text);
                sourceLanguage = detected.language;
            }
            if (sourceLanguage === targetLanguage) {
                return text;
            }
            console.log(`Translating "${text}" from ${sourceLanguage} to ${targetLanguage}`);
            return `[${targetLanguage.toUpperCase()}] ${text}`;
        }
        catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
    async getTranslations(language) {
        try {
            const translations = {
                'common.welcome': this.getTranslation('common.welcome', language),
                'common.login': this.getTranslation('common.login', language),
                'common.logout': this.getTranslation('common.logout', language),
                'dashboard.title': this.getTranslation('dashboard.title', language),
                'navigation.dashboard': this.getTranslation('navigation.dashboard', language),
                'navigation.properties': this.getTranslation('navigation.properties', language),
                'navigation.tenants': this.getTranslation('navigation.tenants', language),
                'navigation.payments': this.getTranslation('navigation.payments', language),
                'navigation.settings': this.getTranslation('navigation.settings', language)
            };
            return { language, translations };
        }
        catch (error) {
            console.error('Failed to get translations:', error);
            return { language, translations: {} };
        }
    }
    getTranslation(key, language) {
        const translations = {
            'common.welcome': {
                en: 'Welcome',
                es: 'Bienvenido',
                fr: 'Bienvenue',
                de: 'Willkommen',
                zh: '欢迎',
                ja: 'ようこそ',
                ko: '환영합니다',
                ar: 'مرحبا',
                hi: 'स्वागत है'
            },
            'common.login': {
                en: 'Login',
                es: 'Iniciar sesión',
                fr: 'Connexion',
                de: 'Anmelden',
                zh: '登录',
                ja: 'ログイン',
                ko: '로그인',
                ar: 'تسجيل الدخول',
                hi: 'लॉग इन करें'
            },
            'common.logout': {
                en: 'Logout',
                es: 'Cerrar sesión',
                fr: 'Déconnexion',
                de: 'Abmelden',
                zh: '登出',
                ja: 'ログアウト',
                ko: '로그아웃',
                ar: 'تسجيل الخروج',
                hi: 'लॉग आउट'
            },
            'dashboard.title': {
                en: 'Dashboard',
                es: 'Panel de control',
                fr: 'Tableau de bord',
                de: 'Dashboard',
                zh: '仪表板',
                ja: 'ダッシュボード',
                ko: '대시보드',
                ar: 'لوحة القيادة',
                hi: 'डैशबोर्ड'
            }
        };
        return translations[key]?.[language] || translations[key]?.['en'] || key;
    }
    async updateTranslation(language, key, value) {
        try {
            console.log(`Translation updated: ${language}.${key} = ${value}`);
            return { success: true };
        }
        catch (error) {
            console.error('Failed to update translation:', error);
            return { success: false, error: error.message };
        }
    }
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    async getUserLanguagePreference(userId) {
        try {
            const user = await User_1.default.findById(userId);
            return {
                language: user?.language || 'en',
                autoDetect: user?.autoDetectLanguage || true
            };
        }
        catch (error) {
            console.error('Failed to get user language preference:', error);
            return { language: 'en', autoDetect: true };
        }
    }
    async setUserLanguagePreference(userId, language, autoDetect = true) {
        try {
            await User_1.default.findByIdAndUpdate(userId, {
                language,
                autoDetectLanguage: autoDetect
            });
            return { success: true };
        }
        catch (error) {
            console.error('Failed to set user language preference:', error);
            return { success: false, error: error.message };
        }
    }
    async detectUserLanguage(req) {
        try {
            if (req.user?.language) {
                return req.user.language;
            }
            const acceptLanguage = req.headers['accept-language'];
            if (acceptLanguage) {
                const languages = acceptLanguage.split(',').map((lang) => {
                    const [code] = lang.trim().split(';');
                    return code.split('-')[0];
                });
                for (const lang of languages) {
                    if (this.supportedLanguages.find(sl => sl.code === lang)) {
                        return lang;
                    }
                }
            }
            return 'en';
        }
        catch (error) {
            console.error('User language detection error:', error);
            return 'en';
        }
    }
}
exports.default = new TranslationService();
