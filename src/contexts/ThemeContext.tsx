'use client';
import React, { createContext, useContext, useState } from 'react';

type GradientTheme = 'blue' | 'green' | 'orange' | 'purple' | 'red';

interface ThemeContextType {
  gradientTheme: GradientTheme;
  setGradientTheme: (theme: GradientTheme) => void;
  getGradientClass: (section: 'property' | 'tenant' | 'payment' | 'maintenance') => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const gradientMap = {
  property: {
    blue: 'gradient-blue',
    green: 'gradient-green', 
    orange: 'gradient-orange-blue',
    purple: 'gradient-primary',
    red: 'gradient-maintenance'
  },
  tenant: {
    blue: 'gradient-blue',
    green: 'gradient-green',
    orange: 'gradient-orange-blue', 
    purple: 'gradient-primary',
    red: 'gradient-maintenance'
  },
  payment: {
    blue: 'gradient-blue',
    green: 'gradient-green',
    orange: 'universal-gradient-payment',
    purple: 'gradient-primary', 
    red: 'gradient-maintenance'
  },
  maintenance: {
    blue: 'gradient-blue',
    green: 'gradient-green',
    orange: 'gradient-orange-blue',
    purple: 'gradient-primary',
    red: 'universal-gradient-maintenance'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gradientTheme, setGradientTheme] = useState<GradientTheme>('blue');

  const getGradientClass = (section: 'property' | 'tenant' | 'payment' | 'maintenance') => {
    return gradientMap[section][gradientTheme];
  };

  return (
    <ThemeContext.Provider value={{ gradientTheme, setGradientTheme, getGradientClass }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};