"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Search, 
  User, 
  Rocket, 
  BookOpen
} from "lucide-react";

import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{
    name: { en: string; sd: string };
    href: string;
  }>;
  currentPath: string;
  language: 'en' | 'sd';
  isRTL: boolean;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  categories,
  currentPath,
  language,
  isRTL
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);



  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Trap focus within drawer
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/' || currentPath === '/en' || currentPath === '/sd';
    return currentPath?.includes(href) || currentPath?.endsWith(href);
  };

  const signInLabel = language === 'sd' ? 'داخل ٿيو' : 'Sign In';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 z-50 h-full w-80 bg-background border-l border-border/20 shadow-xl",
          "transform transition-transform duration-300 ease-out",
          isRTL ? "right-0" : "left-0",
          isOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold">
            {language === 'sd' ? 'نيويگيشن' : 'Navigation'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Search Field */}
          <div className="p-4 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={language === 'sd' ? 'ڳوليو...' : 'Search...'}
                className="pl-10 pr-4 h-10"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              {language === 'sd' ? 'صنفون' : 'Categories'}
            </h3>
            <div className="space-y-1">
              {categories.map((item) => (
                <div key={item.name[language] || item.name.en}>
                  <Link href={language === 'sd' ? `/sd${item.href}` : `/en${item.href}`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-11 px-4 text-left text-sm font-medium rounded-lg",
                        isActive(item.href)
                          ? 'text-foreground bg-muted/50'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      onClick={onClose}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      <span className={language === 'sd' ? 'auto-sindhi-font nav-text' : ''}>
                        {item.name[language] || item.name.en}
                      </span>
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-border/20 space-y-3">
            {/* Deploy & Learn */}
            <div className="space-y-2">
              <Button
                variant="default"
                className="w-full h-11 items-center gap-2"
                aria-label="Deploy"
              >
                <Rocket className="w-4 h-4" />
                <span>Deploy</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-11 items-center gap-2"
                aria-label="Learn"
              >
                <BookOpen className="w-4 h-4" />
                <span>Learn</span>
              </Button>
            </div>

            {/* Utilities */}
            <div className="space-y-2">
              {/* Language Switcher */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/20">
                <span className="text-sm font-medium">
                  {language === 'sd' ? 'ٻولي' : 'Language'}
                </span>
                <LanguageSwitcher />
              </div>

              {/* Sign In */}
              <Button
                variant="ghost"
                className="w-full h-11 justify-start items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                asChild
              >
                <Link href={language === 'sd' ? "/sd/login" : "/en/login"} onClick={onClose}>
                  <User className="w-4 h-4" />
                  <span className={language === 'sd' ? 'auto-sindhi-font nav-text' : ''}>
                    {signInLabel}
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
