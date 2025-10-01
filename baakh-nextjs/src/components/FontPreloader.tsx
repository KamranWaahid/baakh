'use client';

import { useEffect } from 'react';

export default function FontPreloader() {
  useEffect(() => {
    // Preload critical fonts for better performance
    const preloadFonts = () => {
      // Preload Google Fonts
      const googleFonts = [
        'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600&display=swap',
        'https://fonts.googleapis.com/css2?family=Lateef:wght@400;500;600&display=swap',
        'https://fonts.googleapis.com/css2?family=Amiri:wght@400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600&display=swap'
      ];

      googleFonts.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = fontUrl;
        link.onload = () => {
          link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
      });

      // Preload local MB Lateefi font (served from /public)
      const localFonts = [
        '/fonts/MB-Lateefi-SK-2.0.woff2',
        '/fonts/MB-Lateefi-SK-2.0.woff'
      ];

      localFonts.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = fontUrl.endsWith('.woff') ? 'font/woff' : 'font/woff2';
        link.href = fontUrl;
        link.crossOrigin = '';
        document.head.appendChild(link);
      });
    };

    preloadFonts();

    // Add font loading detection
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('400 16px "Lateef"'),
        document.fonts.load('400 16px "Noto Naskh Arabic"'),
        document.fonts.load('400 16px "Noto Sans Arabic"'),
        document.fonts.load('400 16px "Amiri"')
      ]).then(() => {
        // Fonts loaded successfully
        document.documentElement.classList.add('fonts-loaded');
      }).catch(() => {
        // Fallback fonts will be used
        document.documentElement.classList.add('fonts-fallback');
      });
    }
  }, []);

  return null;
}
