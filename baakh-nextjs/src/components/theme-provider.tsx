"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Function to get initial theme - FORCE LIGHT MODE ONLY
function getInitialTheme(): Theme {
  // Always return light mode - dark mode is disabled
  return "light";
}

// Function to apply theme to document
function applyTheme(theme: Theme) {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Force light mode - ignore localStorage and system preferences
    // Dark mode is completely disabled
    
    // Immediately force light mode on document
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("dark");
      root.classList.add("light");
      
      // Add CSS override to disable dark mode completely
      const style = document.createElement('style');
      style.id = 'force-light-mode';
      style.textContent = `
        /* Force light mode - disable all dark mode styles */
        .dark, [class*="dark:"] {
          /* Override all dark mode styles to use light mode equivalents */
          background-color: white !important;
          color: #111827 !important;
          border-color: #e5e7eb !important;
        }
        
        /* Override dark mode CSS variables */
        :root.dark {
          --background: 0 0% 100% !important;
          --foreground: 0 0% 9% !important;
          --card: 0 0% 100% !important;
          --card-foreground: 0 0% 9% !important;
          --popover: 0 0% 100% !important;
          --popover-foreground: 0 0% 9% !important;
          --primary: 0 0% 9% !important;
          --primary-foreground: 0 0% 98% !important;
          --secondary: 0 0% 96.1% !important;
          --secondary-foreground: 0 0% 9% !important;
          --muted: 0 0% 96.1% !important;
          --muted-foreground: 0 0% 45.1% !important;
          --accent: 0 0% 96.1% !important;
          --accent-foreground: 0 0% 9% !important;
          --destructive: 0 84.2% 60.2% !important;
          --destructive-foreground: 0 0% 98% !important;
          --border: 0 0% 89.8% !important;
          --input: 0 0% 89.8% !important;
          --ring: 0 0% 9% !important;
        }
      `;
      
      // Remove existing style if it exists
      const existingStyle = document.getElementById('force-light-mode');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      // Cleanup function to remove the style
      return () => {
        const styleToRemove = document.getElementById('force-light-mode');
        if (styleToRemove) {
          styleToRemove.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Force light mode - clear any dark mode settings
    try {
      // Remove any existing theme from localStorage
      localStorage.removeItem("baakh-theme");
      // Force document to use light mode
      const root = document.documentElement;
      root.classList.remove("dark");
      root.classList.add("light");
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Set up a continuous monitor to ensure dark mode is never applied
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('dark')) {
            target.classList.remove('dark');
            target.classList.add('light');
          }
        }
      });
    });
    
    // Observe the document element for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [mounted]);

  const toggleTheme = () => {
    // Dark mode is disabled - do nothing
    // Always stays in light mode
  };

  const setTheme = (newTheme: Theme) => {
    // Only allow light mode - ignore dark mode requests
    if (newTheme === "light") {
      setThemeState(newTheme);
    }
    // Dark mode requests are ignored
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 