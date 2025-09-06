import { Inter } from "next/font/google";
import { ThemeWrapper } from "@/components/theme-wrapper";
import { LocaleProvider } from "./locale-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";

import "../globals.css";

// Import Navigation directly
import Navigation from "@/components/ui/Navigation";
// Import Footer component
import Footer from "@/components/ui/Footer";

// Modern Font System - Only Inter
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ['300', '400', '500', '600', '700'],
});


export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: 'sd' | 'en' }>;
}) {
  // Default to Sindhi if no locale is provided
  const { locale = 'sd' } = await params;
  
  // Set text direction based on locale
  const textDirection = locale === 'sd' ? 'rtl' : 'ltr';
  
  return (
    <div 
      className={`${inter.variable}`}
      dir={textDirection}
      lang={locale}
    >
      <ThemeWrapper>
        <LanguageProvider>
          <LocaleProvider locale={locale}>
            <Navigation />
            <div>
              {children}
            </div>
            <Footer />
          </LocaleProvider>
        </LanguageProvider>
      </ThemeWrapper>
    </div>
  );
}
