"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className = "", size = "sm" }: ThemeToggleProps) {
  const [fallbackTheme, setFallbackTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem("baakh-theme") as "light" | "dark";
    if (savedTheme) {
      setFallbackTheme(savedTheme);
    } else {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setFallbackTheme(systemTheme);
    }
  }, []);

  // Try to use the theme context, fallback to local state if not available
  let theme: "light" | "dark";
  let toggleTheme: () => void;
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // Fallback when not within ThemeProvider
    theme = fallbackTheme;
    toggleTheme = () => {
      const newTheme = fallbackTheme === "light" ? "dark" : "light";
      setFallbackTheme(newTheme);
      localStorage.setItem("baakh-theme", newTheme);
      
      // Apply theme to document immediately
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
    };
  }

  const sizeClasses = {
    sm: "h-9 w-9",
    md: "h-10 w-10", 
    lg: "h-11 w-11"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  // Show loading state until mounted to prevent flash
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className={`${sizeClasses[size]} p-0 ${className}`}
        disabled
      >
        <div className="flex items-center justify-center">
          <Sun className={iconSizes[size]} />
        </div>
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      className={`${sizeClasses[size]} p-0 ${className} ${
        theme === 'dark' 
          ? 'text-amber-400 hover:text-amber-300' 
          : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
      } transition-all duration-200`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        {theme === "dark" ? (
          <Sun className={iconSizes[size]} />
        ) : (
          <Moon className={iconSizes[size]} />
        )}
      </motion.div>
    </Button>
  );
} 