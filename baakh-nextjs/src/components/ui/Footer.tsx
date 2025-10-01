"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import Image from "next/image";

export default function Footer() {
  const pathname = usePathname();
  
  // Detect locale from pathname for routing and language
  const locale = pathname?.startsWith('/sd') ? 'sd' : 'en';
  const isRTL = locale === 'sd';

  // Footer navigation items
  const footerLinks = [
    { name: { en: "About", sd: "باري ۾" }, href: "/about" },
    { name: { en: "Contact", sd: "رابطو" }, href: "/contact" },
    { name: { en: "Privacy", sd: "رازداري" }, href: "/privacy-policy" },
    { name: { en: "Terms", sd: "شرطن" }, href: "/terms-and-conditions" }
  ];

  // Multi-lingual content
  const content = {
    // Brand section
    brandDescription: {
      en: "A modern portal for discovering, reading, and enjoying the great heritage of Sindhi poetry",
      sd: "سنڌي شاعريءَ جي عظيم ورثي کي ڳولي، پڙهڻ ۽ لطف اندوز ٿيڻ لاءِ هڪ جديد پورٽل"
    },
    
    // Section headers
    quickLinks: {
      en: "Quick Links",
      sd: "جلدي لنڪ"
    },
    poetryCategories: {
      en: "Poetry Categories",
      sd: "شاعري جا قسم"
    },
    
    // Navigation items
    poets: {
      en: "Poets",
      sd: "شاعر"
    },
    poetry: {
      en: "Poetry",
      sd: "شاعري"
    },
    couplets: {
      en: "Couplets",
      sd: "شعر"
    },
    categories: {
      en: "Categories",
      sd: "صنفون"
    },
    
    // Bottom section
    allRightsReserved: {
      en: "All rights reserved",
      sd: "سڀ حق محفوظ آهن"
    },
    madeFor: {
      en: "Made for Sindhi poetry",
      sd: "سنڌي شاعري لاءِ"
    },
    withLove: {
      en: "with love",
      sd: "سان ٺاھيل"
    }
  };

  // Smart font detection - prevents Sindhi fonts on numbers and English characters
  const getSmartFontClass = (text?: string | null) => {
    if (!text) return 'font-inter';
    
    // Check if text contains only Sindhi characters
    const hasSindhiChars = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
    const hasEnglishChars = /[a-zA-Z0-9.,;:!?@#$%^&*()_+\-=\[\]{}|\\:";'<>?/~`]/.test(text);
    
    // Use Sindhi font only if it has Sindhi characters and no English characters/numbers
    if (hasSindhiChars && !hasEnglishChars) {
      return 'font-sindhi';
    }
    
    // Default to Inter for numbers, English characters, and mixed content
    return 'font-inter';
  };

  return (
    <motion.footer 
      className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 border-t border-gray-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Brand Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src="/Baakh.svg" alt="Baakh" className="h-10 w-auto" />
              <div>
                <h3 className={`text-h1 font-bold text-gray-900 ${isRTL ? 'font-sindhi' : 'font-inter'}`}>
                  {isRTL ? 'باک' : 'Baakh'}
                </h3>
                <p className={`text-caption text-gray-600 ${isRTL ? 'font-sindhi' : 'font-inter'}`}>
                  {isRTL ? 'سنڌي شاعري جو آرڪائيوَ' : 'Sindhi Poetry Archive'}
                </p>
              </div>
            </div>
            
            <p className={`text-gray-600 leading-7 max-w-sm ${getSmartFontClass(content.brandDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
              {content.brandDescription[locale]}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className={`text-lg font-semibold text-gray-900 ${getSmartFontClass(content.quickLinks[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
              {content.quickLinks[locale]}
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {footerLinks.map((link) => (
                <Link
                  key={link.name[locale]}
                  href={locale === 'sd' ? `/sd${link.href}` : `/en${link.href}`}
                  className={`group flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors duration-200 ${getSmartFontClass(link.name[locale])} ${!isRTL ? 'font-medium tracking-wide' : ''}`}
                >
                  <span className="font-medium">{link.name[locale]}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Poetry Categories */}
          <div className="space-y-5">
            <h4 className={`text-lg font-semibold text-gray-900 ${getSmartFontClass(content.poetryCategories[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
              {content.poetryCategories[locale]}
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href={locale === 'sd' ? "/sd/poets" : "/en/poets"}
                className={`group flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors duration-200 ${getSmartFontClass(content.poets[locale])} ${!isRTL ? 'font-medium tracking-wide' : ''}`}
              >
                <span className="font-medium">{content.poets[locale]}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href={locale === 'sd' ? "/sd/poetry" : "/en/poetry"}
                className={`group flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors duration-200 ${getSmartFontClass(content.poetry[locale])} ${!isRTL ? 'font-medium tracking-wide' : ''}`}
              >
                <span className="font-medium">{content.poetry[locale]}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href={locale === 'sd' ? "/sd/couplets" : "/en/couplets"}
                className={`group flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors duration-200 ${getSmartFontClass(content.couplets[locale])} ${!isRTL ? 'font-medium tracking-wide' : ''}`}
              >
                <span className="font-medium">{content.couplets[locale]}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href={locale === 'sd' ? "/sd/categories" : "/en/categories"}
                className={`group flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors duration-200 ${getSmartFontClass(content.categories[locale])} ${!isRTL ? 'font-medium tracking-wide' : ''}`}
              >
                <span className="font-medium">{content.categories[locale]}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-14 pt-7 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className={`text-sm text-gray-500 leading-6 ${getSmartFontClass(content.allRightsReserved[locale])} ${!isRTL ? 'font-medium' : ''}`}>
              © {new Date().getFullYear()} {isRTL ? 'باک' : 'Baakh'}. {content.allRightsReserved[locale]}
            </div>

            {/* Made with Love */}
            <div className={`flex items-center gap-2 text-sm text-gray-500 leading-6 ${getSmartFontClass(content.madeFor[locale] + ' ' + content.withLove[locale])} ${!isRTL ? 'font-medium' : ''}`}>
              <span>{content.madeFor[locale]}</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>{content.withLove[locale]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </motion.footer>
  );
}
