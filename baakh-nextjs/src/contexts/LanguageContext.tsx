"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Language = 'en' | 'sd';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageOpen: boolean;
  setIsLanguageOpen: (open: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [language, setLanguageState] = useState<Language>('en');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Initialize language from URL or localStorage
  useEffect(() => {
    const urlLang = searchParams.get('lang') as Language;
    if (urlLang && (urlLang === 'en' || urlLang === 'sd')) {
      setLanguageState(urlLang);
      localStorage.setItem('baakh-language', urlLang);
    } else {
      const savedLang = localStorage.getItem('baakh-language') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'sd')) {
        setLanguageState(savedLang);
      }
    }
  }, [searchParams]);

  // Function to change language
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('baakh-language', newLang);
    setIsLanguageOpen(false);

    // Update URL with new language parameter
    const params = new URLSearchParams(searchParams);
    params.set('lang', newLang);
    
    // Navigate to the same page with new language
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      isLanguageOpen,
      setIsLanguageOpen
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
