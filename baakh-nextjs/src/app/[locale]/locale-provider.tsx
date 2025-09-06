'use client';

import { useEffect } from 'react';

interface LocaleProviderProps {
  children: React.ReactNode;
  locale: 'sd' | 'en';
}

export function LocaleProvider({ children, locale }: LocaleProviderProps) {
  useEffect(() => {
    // Set the HTML lang attribute
    document.documentElement.lang = locale;
    
    // Add font variables to the HTML element
    document.documentElement.classList.add('__variable_5cfdac', '__variable_9a8899');
    
    return () => {
      // Clean up font variables when component unmounts
      document.documentElement.classList.remove('__variable_5cfdac', '__variable_9a8899');
    };
  }, [locale]);

  return <>{children}</>;
}
