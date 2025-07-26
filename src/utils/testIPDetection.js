// Test IP detection and language mapping
import { detectUserLocation } from '../services/ipService.js';
import { getLanguageByCountry } from './languageConfig.js';

const testIPDetection = async () => {

  try {
    const location = await detectUserLocation();

    if (location?.countryCode) {
      const language = getLanguageByCountry(location.countryCode);
      `);
      `);
    } else {

    }
  } catch (error) {
    console.error('IP detection failed:', error);
  }
};

// Test country mappings
const testCountryMappings = () => {

  const testCountries = ['US', 'CN', 'JP', 'DE', 'FR', 'ES', 'IN', 'BR', 'RU', 'SA'];
  
  testCountries.forEach(country => {
    const language = getLanguageByCountry(country);
    ${language.flag}`);
  });
};

testIPDetection();
testCountryMappings();