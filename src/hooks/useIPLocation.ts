import { useState, useEffect } from 'react';

interface LocationData {
  country: string;
  countryCode: string;
  language: string;
  currency: string;
}

export const useIPLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try multiple IP geolocation services
        // Skip IP detection to avoid CORS issues - use defaults
        const data = { country_name: 'United States', country_code: 'US', currency: 'USD' };
        
        const locationData: LocationData = {
          country: data.country_name || 'United States',
          countryCode: data.country_code || 'US',
          language: getLanguageFromCountry(data.country_code || 'US'),
          currency: data.currency || 'USD'
        };
        
        setLocation(locationData);
      } catch (error) {
        // Fallback to default
        setLocation({
          country: 'United States',
          countryCode: 'US',
          language: 'en',
          currency: 'USD'
        });
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  return { location, isLoading };
};

const getLanguageFromCountry = (countryCode: string): string => {
  const countryLanguageMap: Record<string, string> = {
    'BD': 'bn', // Bangladesh -> Bengali
    'IN': 'bn', // India -> Bengali (for Bengali speakers)
    'US': 'en',
    'GB': 'en',
    'CA': 'en',
    'AU': 'en',
    'NZ': 'en',
    'IE': 'en',
    'ZA': 'en',
    // Add more mappings as needed
  };
  
  return countryLanguageMap[countryCode] || 'en';
};