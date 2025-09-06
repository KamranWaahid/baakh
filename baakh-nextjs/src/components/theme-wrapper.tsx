"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "./theme-provider";

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, always wrap with ThemeProvider to avoid hydration issues
  if (!mounted) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  // Always wrap with ThemeProvider
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
} 