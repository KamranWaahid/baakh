"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: "en", name: "English", symbol: "E" },
  { code: "sd", name: "سنڌي", symbol: "س" }
];

export default function LanguageDropdown() {
  const { language, setLanguage, isLanguageOpen, setIsLanguageOpen } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-9 px-3 rounded-full flex items-center gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage?.symbol}</span>
      </Button>
      
      {/* Language Popup Menu */}
      {isLanguageOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors ${
                language === lang.code ? 'bg-accent/50 text-accent-foreground' : ''
              }`}
              onClick={() => setLanguage(lang.code as 'en' | 'sd')}
              style={{ outline: 'none' }}
              onMouseDown={(e) => e.preventDefault()}
              onFocus={(e) => e.currentTarget.blur()}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                language === lang.code 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {lang.symbol}
              </span>
              <span className={lang.code === 'sd' ? 'auto-sindhi-font nav-text' : 'font-english'}>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-xs text-primary">✓</span>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
