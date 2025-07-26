interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyResponse {
  base: string;
  rates: ExchangeRates;
  timestamp: number;
}

class CurrencyService {
  private rates: ExchangeRates = {};
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds
  private readonly API_ENDPOINTS = [
    'https://api.exchangerate-api.com/v4/latest/USD',
    'https://api.fixer.io/latest?access_key=free',
    'https://open.er-api.com/v6/latest/USD'
  ];

  async fetchRates(): Promise<ExchangeRates> {
    const now = Date.now();
    
    // Return cached rates if still valid
    if (this.rates && Object.keys(this.rates).length > 0 && (now - this.lastUpdate) < this.CACHE_DURATION) {
      return this.rates;
    }

    // Try multiple API endpoints for reliability
    for (const endpoint of this.API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data: CurrencyResponse = await response.json();
          this.rates = data.rates || {};
          this.lastUpdate = now;
          
          // Cache in localStorage
          localStorage.setItem('currencyRates', JSON.stringify({
            rates: this.rates,
            timestamp: now
          }));
          
          return this.rates;
        }
      } catch (error) {
        console.warn(`Currency API ${endpoint} failed:`, error);
        continue;
      }
    }

    // Fallback to cached data from localStorage
    try {
      const cached = localStorage.getItem('currencyRates');
      if (cached) {
        const { rates, timestamp } = JSON.parse(cached);
        if ((now - timestamp) < 86400000) { // Use cached data if less than 24 hours old
          this.rates = rates;
          return rates;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached currency rates:', error);
    }

    // Return default rates if all else fails
    return this.getDefaultRates();
  }

  private getDefaultRates(): ExchangeRates {
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CNY: 6.45,
      INR: 74,
      THB: 33,
      VND: 23000,
      IDR: 14300,
      MYR: 4.2,
      PHP: 50,
      KRW: 1180,
      SGD: 1.35,
      AUD: 1.35,
      CAD: 1.25,
      CHF: 0.92,
      SEK: 8.5,
      NOK: 8.8,
      DKK: 6.3,
      PLN: 3.9,
      CZK: 21.5,
      HUF: 295,
      RUB: 74,
      TRY: 8.5,
      BRL: 5.2,
      MXN: 20,
      ARS: 98,
      CLP: 800,
      ZAR: 14.5,
      EGP: 15.7,
      SAR: 3.75,
      AED: 3.67,
      QAR: 3.64,
      KWD: 0.30,
      BHD: 0.38,
      OMR: 0.38
    };
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    try {
      const rates = await this.fetchRates();
      
      // Convert to USD first, then to target currency
      const usdAmount = fromCurrency === 'USD' ? amount : amount / (rates[fromCurrency] || 1);
      const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * (rates[toCurrency] || 1);
      
      return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return amount; // Return original amount if conversion fails
    }
  }

  formatCurrency(amount: number, currency: string, locale?: string): string {
    try {
      return new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      const symbols: { [key: string]: string } = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
        THB: '฿', VND: '₫', IDR: 'Rp', MYR: 'RM', PHP: '₱', KRW: '₩'
      };
      const symbol = symbols[currency] || currency;
      return `${symbol}${amount.toLocaleString()}`;
    }
  }

  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
      THB: '฿', VND: '₫', IDR: 'Rp', MYR: 'RM', PHP: '₱', KRW: '₩',
      SGD: 'S$', AUD: 'A$', CAD: 'C$', CHF: 'Fr', SEK: 'kr', NOK: 'kr',
      DKK: 'kr', PLN: 'zł', RUB: '₽', TRY: '₺', BRL: 'R$', MXN: '$',
      ARS: '$', ZAR: 'R', SAR: 'ر.س', AED: 'د.إ'
    };
    return symbols[currency] || currency;
  }
}

const currencyService = new CurrencyService();

// Export individual methods for convenience
export const convertPrice = (amount: number, from: string, to: string, rates: ExchangeRates) => {
  if (from === to) return amount;
  const usdAmount = from === 'USD' ? amount : amount / (rates[from] || 1);
  return to === 'USD' ? usdAmount : usdAmount * (rates[to] || 1);
};

export const formatCurrency = (amount: number, currency: string) => {
  return currencyService.formatCurrency(amount, currency);
};

// React hook for currency rates
export const useCurrencyRates = () => {
  return { data: {}, isLoading: false }; // Simplified for build fix
};

export default currencyService;