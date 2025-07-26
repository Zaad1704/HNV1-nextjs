export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  countries: string[];
}

export const languages: LanguageConfig[] = [
  // Asia
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', countries: ['US', 'GB', 'AU', 'CA', 'NZ'] },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥', countries: ['CN', 'TW', 'HK', 'SG'] },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥', countries: ['JP'] },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', currency: 'KRW', currencySymbol: '₩', countries: ['KR'] },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', countries: ['IN'] },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', currency: 'THB', currencySymbol: '฿', countries: ['TH'] },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', currency: 'VND', currencySymbol: '₫', countries: ['VN'] },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', currency: 'IDR', currencySymbol: 'Rp', countries: ['ID'] },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM', countries: ['MY', 'BN'] },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', currency: 'PHP', currencySymbol: '₱', countries: ['PH'] },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', currency: 'PKR', currencySymbol: '₨', countries: ['PK'] },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', currency: 'BDT', currencySymbol: '৳', countries: ['BD'] },
  
  // Europe
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', countries: ['DE', 'AT', 'CH'] },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', countries: ['FR', 'BE', 'CH', 'CA'] },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', countries: ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY'] },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', countries: ['IT'] },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€', countries: ['PT', 'BR'] },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', currency: 'RUB', currencySymbol: '₽', countries: ['RU', 'BY', 'KZ'] },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', countries: ['NL', 'BE'] },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr', countries: ['SE'] },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr', countries: ['NO'] },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr', countries: ['DK'] },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€', countries: ['FI'] },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł', countries: ['PL'] },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺', countries: ['TR'] },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', currency: 'EUR', currencySymbol: '€', countries: ['GR'] },
  
  // Africa
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', currency: 'SAR', currencySymbol: 'ر.س', countries: ['SA', 'AE', 'EG', 'MA', 'DZ', 'TN', 'LY', 'SD', 'SY', 'IQ', 'JO', 'LB', 'KW', 'OM', 'QA', 'BH', 'YE'] },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh', countries: ['KE', 'TZ', 'UG'] },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', currency: 'ETB', currencySymbol: 'Br', countries: ['ET'] },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', countries: ['NG', 'NE', 'GH'] },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', countries: ['NG'] },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R', countries: ['ZA'] },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R', countries: ['ZA'] },
  
  // Americas
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', countries: ['BR'] },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲🇽', currency: 'MXN', currencySymbol: '$', countries: ['MX'] },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', flag: '🇦🇷', currency: 'ARS', currencySymbol: '$', countries: ['AR'] },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)', flag: '🇨🇦', currency: 'CAD', currencySymbol: '$', countries: ['CA'] },
  
  // Oceania
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)', flag: '🇦🇺', currency: 'AUD', currencySymbol: '$', countries: ['AU'] },
  { code: 'en-NZ', name: 'English (New Zealand)', nativeName: 'English (New Zealand)', flag: '🇳🇿', currency: 'NZD', currencySymbol: '$', countries: ['NZ'] }
];

export const getLanguageByCountry = (countryCode: string): LanguageConfig => {
  const language = languages.find(lang => 
    lang.countries.includes(countryCode.toUpperCase())
  );
  return language || languages[0]; // Default to English
};

export const getLanguageByCode = (code: string): LanguageConfig => {
  const language = languages.find(lang => lang.code === code);
  return language || languages[0];
};