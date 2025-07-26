interface IPResponse {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  currency: string;
  timezone: string;
}

export const detectUserLocation = async (): Promise<IPResponse | null> => {
  try {
    // Use ipinfo.io as primary service
    const token = import.meta.env.VITE_IPINFO_TOKEN;
    const url = token ? `https://ipinfo.io/json?token=${token}` : 'https://ipinfo.io/json';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country,
        countryCode: data.country,
        region: data.region,
        city: data.city,
        currency: 'USD', // Will be mapped from country
        timezone: data.timezone
      };
    }
    
    // Fallback to free service
    const fallback = await fetch('https://ipapi.co/json/');
    if (fallback.ok) {
      const data = await fallback.json();
      return {
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        currency: data.currency,
        timezone: data.timezone
      };
    }
    
    return null;
  } catch (error) {
    console.error('IP detection failed:', error);
    return null;
  }
};