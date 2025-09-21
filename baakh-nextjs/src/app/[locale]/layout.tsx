import { ThemeWrapper } from "@/components/theme-wrapper";
import { LocaleProvider } from "./locale-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";

import "../globals.css";

// Import Navigation directly
import Navigation from "@/components/ui/Navigation";
// Import Footer component
import Footer from "@/components/ui/Footer";
// Import Feedback Card component
import FeedbackCard from "@/components/ui/FeedbackCard";

// Modern Font System - Helvetica Now Text Regular (system font)


export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Default to Sindhi if no locale is provided
  const { locale = 'sd' } = await params;
  
  // Validate locale and fallback to 'sd' if invalid
  const validLocale = (locale === 'sd' || locale === 'en') ? locale : 'sd';
  
  // Set text direction based on locale
  const textDirection = validLocale === 'sd' ? 'rtl' : 'ltr';
  
  return (
    <div 
      dir={textDirection}
      lang={validLocale}
      className="public-site"
    >
      <ThemeWrapper>
        <LanguageProvider>
          <LocaleProvider locale={validLocale}>
            <TooltipProvider>
              <Navigation />
              <div>
                {children}
              </div>
              <Footer />
              <FeedbackCard />
            </TooltipProvider>
          </LocaleProvider>
        </LanguageProvider>
      </ThemeWrapper>
    </div>
  );
}
