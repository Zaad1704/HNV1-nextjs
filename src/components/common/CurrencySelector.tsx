import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' }
];

const CurrencySelector = () => {
  const { currencyCode, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const selectedCurrency = currencies.find(c => c.code === currencyCode) || currencies[0];

  const handleCurrencyChange = (currency: typeof currencies[0]) => {
    setCurrency(currency.code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-app-border bg-app-surface hover:bg-app-bg transition-colors"
      >
        <span className="text-sm font-medium">{selectedCurrency.symbol}</span>
        <span className="text-sm text-text-secondary">{selectedCurrency.code}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-app-surface border border-app-border rounded-lg shadow-app-lg z-50">
          <div className="p-2">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency)}
                className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-app-bg transition-colors ${
                  selectedCurrency.code === currency.code ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span className="text-sm">{currency.code}</span>
                </div>
                <span className="text-xs text-text-secondary">{currency.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;