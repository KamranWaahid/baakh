"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const languages = [
  { code: "sd", name: "سنڌي", symbol: "س" },
  { code: "en", name: "English", symbol: "E" }
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract locale from pathname or default to Sindhi
  const currentLocale = pathname?.startsWith('/en') ? 'en' : 'sd';
  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  const switchLanguage = (newLocale: string) => {
    // Simple language switching - for now just log the action
    console.log(`Switching to ${newLocale}`);
    
    // TODO: Implement proper language switching logic
    // This would typically involve updating the URL and reloading with new locale
    if (newLocale === 'sd') {
      // Redirect to Sindhi version
      const newPath = pathname?.replace('/en', '/sd') || '/sd';
      router.push(newPath);
    } else {
      // Redirect to English version
      const newPath = pathname?.replace('/sd', '/en') || '/en';
      router.push(newPath);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 rounded-md flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-neutral-100 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <Languages className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">
            {currentLocale === 'sd' ? '' : currentLanguage?.symbol}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-40 mt-2 p-1 bg-white border border-gray-200/50 rounded-md shadow-none dark:bg-neutral-900 dark:border-neutral-800 [&>*:hover]:bg-transparent [&>*:focus]:bg-transparent"
        sideOffset={8}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={cn(
              "w-full px-3 py-2 text-sm rounded-md cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
              "focus:outline-none",
              currentLocale === lang.code 
                ? 'text-gray-900 font-semibold dark:text-neutral-100' 
                : 'text-gray-600 dark:text-neutral-300'
            )}
            onClick={() => switchLanguage(lang.code)}
            onSelect={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2 w-full">
              <span className={cn(
                "flex-1 text-left",
                lang.code === 'sd' ? 'auto-sindhi-font' : 'font-medium tracking-wide font-english',
                currentLocale === lang.code ? 'font-semibold' : 'font-normal'
              )}>
                {lang.name}
              </span>
              {currentLocale === lang.code && (
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
