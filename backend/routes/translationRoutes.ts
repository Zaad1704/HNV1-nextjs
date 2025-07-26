import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  translateContent,
  detectLanguage,
  getSupportedLanguages,
  translateBulk,
  getUserLanguagePreference,
  setUserLanguagePreference
} from '../controllers/translationController';
import translationService from '../services/translationService';

const router = Router();

// Public routes (no auth required)
router.get('/languages', getSupportedLanguages);
router.post('/detect', detectLanguage);
router.post('/translate', translateContent);
router.post('/translate/bulk', translateBulk);

// Get translations for a specific language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const translations = await translationService.getTranslations(language);
    
    res.status(200).json({
      success: true,
      data: translations
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Auto-detect user language
router.get('/auto-detect', async (req, res) => {
  try {
    const detectedLanguage = await translationService.detectUserLanguage(req);
    res.status(200).json({
      success: true,
      data: { detectedLanguage }
    });
  } catch (error) {
    console.error('Auto-detect language error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected routes (auth required)
router.use(protect);

// Update translation (admin only)
router.put('/:language/:key', async (req, res) => {
  try {
    const user = req.user as any;
    if (user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { language, key } = req.params;
    const { value } = req.body;
    
    const result = await translationService.updateTranslation(language, key, value);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Translation updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to update translation'
      });
    }
  } catch (error) {
    console.error('Update translation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User language preferences
router.get('/user/preference', getUserLanguagePreference);
router.post('/user/preference', setUserLanguagePreference);

export default router;
