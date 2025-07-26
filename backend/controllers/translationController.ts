import { Request, Response, NextFunction } from 'express';
import translationService from '../services/translationService';

export const translateContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text and targetLanguage are required.' 
      });
    }

    const translatedText = await translationService.translateText(text, targetLanguage, sourceLanguage);
    
    res.status(200).json({ 
      success: true, 
      data: {
        originalText: text,
        translatedText,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to translate content.' 
    });
  }
};

export const detectLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required for language detection.' 
      });
    }

    const detectedLanguage = await translationService.detectLanguage(text);
    
    res.status(200).json({ 
      success: true, 
      data: {
        text,
        detectedLanguage,
        confidence: detectedLanguage.confidence || 1
      }
    });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to detect language.' 
    });
  }
};

export const getSupportedLanguages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const languages = translationService.getSupportedLanguages();
    
    res.status(200).json({ 
      success: true, 
      data: {
        languages,
        total: languages.length
      }
    });
  } catch (error) {
    console.error('Get supported languages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get supported languages.' 
    });
  }
};

export const translateBulk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { texts, targetLanguage, sourceLanguage } = req.body;
    
    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Texts array and targetLanguage are required.' 
      });
    }

    const translations = await Promise.all(
      texts.map(text => translationService.translateText(text, targetLanguage, sourceLanguage))
    );
    
    res.status(200).json({ 
      success: true, 
      data: {
        originalTexts: texts,
        translations,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage
      }
    });
  } catch (error) {
    console.error('Bulk translation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to translate texts.' 
    });
  }
};

export const getUserLanguagePreference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any)._id;
    const preference = await translationService.getUserLanguagePreference(userId);
    
    res.status(200).json({ 
      success: true, 
      data: preference
    });
  } catch (error) {
    console.error('Get user language preference error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get language preference.' 
    });
  }
};

export const setUserLanguagePreference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any)._id;
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({ 
        success: false, 
        message: 'Language is required.' 
      });
    }

    await translationService.setUserLanguagePreference(userId, language);
    
    res.status(200).json({ 
      success: true, 
      message: 'Language preference updated successfully.',
      data: { language }
    });
  } catch (error) {
    console.error('Set user language preference error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to set language preference.' 
    });
  }
};