import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api';
import { useTranslation } from 'react-i18next';

const translationCache = new Map<string, string>();

export const useDynamicTranslation = (textToTranslate: string) => {
  const { i18n } = useTranslation();
  const targetLanguage = i18n.language;

  const [translatedText, setTranslatedText] = useState(textToTranslate);
  const [isLoading, setIsLoading] = useState(false);

  const lastProcessedTextRef = useRef(textToTranslate);
  const lastProcessedLanguageRef = useRef(targetLanguage);

  useEffect(() => {
    if (targetLanguage === 'en' || !textToTranslate) {
      if (translatedText !== textToTranslate) {
        setTranslatedText(textToTranslate);
      }
      setIsLoading(false);
      lastProcessedTextRef.current = textToTranslate;
      lastProcessedLanguageRef.current = targetLanguage;
      return;
    }

    const cacheKey = `${targetLanguage}:${textToTranslate}`;
    if (translationCache.has(cacheKey)) {
      const cachedValue = translationCache.get(cacheKey)!;
      if (translatedText !== cachedValue) {
        setTranslatedText(cachedValue);
      }
      setIsLoading(false);
      lastProcessedTextRef.current = textToTranslate;
      lastProcessedLanguageRef.current = targetLanguage;
      return;
    }

    if (
      isLoading ||
      (textToTranslate === lastProcessedTextRef.current && targetLanguage === lastProcessedLanguageRef.current)
    ) {
      return;
    }

    setIsLoading(true);
    lastProcessedTextRef.current = textToTranslate;
    lastProcessedLanguageRef.current = targetLanguage;

    const translate = async () => {
      try {
        const response = await apiClient.post('/translate', {
          text: textToTranslate,
          targetLanguage: targetLanguage,
        });
        const newText = response.data.translatedText;
        translationCache.set(cacheKey, newText);
        setTranslatedText(newText);
      } catch (error) {
        setTranslatedText(textToTranslate); // fallback, never crash
      } finally {
        setIsLoading(false);
      }
    };
    translate();
  }, [textToTranslate, targetLanguage]); // add both as dependencies

  return { translatedText, isLoading };
};
