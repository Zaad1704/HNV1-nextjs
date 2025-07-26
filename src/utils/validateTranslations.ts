import fs from 'fs';
import path from 'path';

interface TranslationFile {
  [key: string]: any;
}

const LOCALES_DIR = path.join(__dirname, '../locales');
const BASE_LOCALE = 'en';

export const validateTranslations = () => {
  const results: { [locale: string]: { missing: string[], extra: string[] } } = {};
  
  // Read base translation file
  const baseTranslationPath = path.join(LOCALES_DIR, BASE_LOCALE, 'translation.json');
  const baseTranslation: TranslationFile = JSON.parse(fs.readFileSync(baseTranslationPath, 'utf8'));
  
  // Get all translation keys from base file
  const baseKeys = getAllKeys(baseTranslation);
  
  // Read all locale directories
  const locales = fs.readdirSync(LOCALES_DIR).filter(dir => 
    fs.statSync(path.join(LOCALES_DIR, dir)).isDirectory() && dir !== BASE_LOCALE
  );
  
  locales.forEach(locale => {
    const translationPath = path.join(LOCALES_DIR, locale, 'translation.json');
    
    if (!fs.existsSync(translationPath)) {
      results[locale] = { missing: baseKeys, extra: [] };
      return;
    }
    
    const translation: TranslationFile = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    const translationKeys = getAllKeys(translation);
    
    const missing = baseKeys.filter(key => !translationKeys.includes(key));
    const extra = translationKeys.filter(key => !baseKeys.includes(key));
    
    results[locale] = { missing, extra };
  });
  
  return results;
};

const getAllKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

export const checkTranslationQuality = (locale: string): { untranslated: string[], suspicious: string[] } => {
  const baseTranslationPath = path.join(LOCALES_DIR, BASE_LOCALE, 'translation.json');
  const translationPath = path.join(LOCALES_DIR, locale, 'translation.json');
  
  if (!fs.existsSync(translationPath)) {
    return { untranslated: [], suspicious: [] };
  }
  
  const baseTranslation: TranslationFile = JSON.parse(fs.readFileSync(baseTranslationPath, 'utf8'));
  const translation: TranslationFile = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
  
  const untranslated: string[] = [];
  const suspicious: string[] = [];
  
  const checkValues = (baseObj: any, transObj: any, prefix = '') => {
    for (const key in baseObj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
        if (transObj[key] && typeof transObj[key] === 'object') {
          checkValues(baseObj[key], transObj[key], fullKey);
        }
      } else {
        const baseValue = baseObj[key];
        const transValue = transObj[key];
        
        // Check if translation is identical to base (likely untranslated)
        if (baseValue === transValue) {
          untranslated.push(fullKey);
        }
        
        // Check for suspicious patterns
        if (transValue && typeof transValue === 'string') {
          // Check if translation contains only English characters (suspicious for non-Latin languages)
          if (locale === 'ar' || locale === 'zh' || locale === 'ja' || locale === 'ko') {
            if (/^[a-zA-Z0-9\s\.,!?'"()-]+$/.test(transValue)) {
              suspicious.push(fullKey);
            }
          }
        }
      }
    }
  };
  
  checkValues(baseTranslation, translation);
  
  return { untranslated, suspicious };
};

// CLI usage
if (require.main === module) {
  console.log('🔍 Validating translations...\n');
  
  const results = validateTranslations();
  
  Object.entries(results).forEach(([locale, { missing, extra }]) => {
    console.log(`📍 ${locale.toUpperCase()}:`);
    
    if (missing.length > 0) {
      console.log(`  ❌ Missing keys (${missing.length}):`);
      missing.slice(0, 5).forEach(key => console.log(`    - ${key}`));
      if (missing.length > 5) console.log(`    ... and ${missing.length - 5} more`);
    }
    
    if (extra.length > 0) {
      console.log(`  ➕ Extra keys (${extra.length}):`);
      extra.slice(0, 3).forEach(key => console.log(`    - ${key}`));
      if (extra.length > 3) console.log(`    ... and ${extra.length - 3} more`);
    }
    
    const quality = checkTranslationQuality(locale);
    if (quality.untranslated.length > 0) {
      console.log(`  🚨 Untranslated (${quality.untranslated.length}):`);
      quality.untranslated.slice(0, 3).forEach(key => console.log(`    - ${key}`));
      if (quality.untranslated.length > 3) console.log(`    ... and ${quality.untranslated.length - 3} more`);
    }
    
    console.log('');
  });
  
  console.log('✅ Translation validation complete!');
}