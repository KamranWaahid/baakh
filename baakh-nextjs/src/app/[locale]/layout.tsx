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
  params: Promise<{ locale?: 'sd' | 'en' }>;
}) {
  // Default to Sindhi if no locale is provided
  const { locale = 'sd' } = await params;
  
  // Set text direction based on locale
  const textDirection = locale === 'sd' ? 'rtl' : 'ltr';
  
  return (
    <div 
      dir={textDirection}
      lang={locale}
      className="public-site"
    >
      <ThemeWrapper>
        <LanguageProvider>
          <LocaleProvider locale={locale}>
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
