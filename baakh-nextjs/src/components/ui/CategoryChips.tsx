"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: Array<{
    name: { en: string; sd: string };
    href: string;
  }>;
  currentPath: string;
  language: 'en' | 'sd';
  isRTL: boolean;
  className?: string;
}

export default function CategoryChips({
  categories,
  currentPath,
  language,
  isRTL,
  className
}: CategoryChipsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll to left or right
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 200; // Adjust scroll amount as needed
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Update scroll buttons on mount and resize
  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [categories]);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath?.includes(href) || currentPath?.endsWith(href);
  };

  // Determine locale from current path
  const locale = currentPath.startsWith('/sd') ? 'sd' : 'en';

  return (
    <div className={cn("relative group", className)}>
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border/20 shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "hover:bg-background hover:border-border"
          )}
          onClick={() => scroll(isRTL ? 'right' : 'left')}
          aria-label={isRTL ? "Scroll right" : "Scroll left"}
        >
          {isRTL ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border/20 shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "hover:bg-background hover:border-border"
          )}
          onClick={() => scroll(isRTL ? 'left' : 'right')}
          aria-label={isRTL ? "Scroll left" : "Scroll right"}
        >
          {isRTL ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex gap-1 overflow-x-auto scrollbar-hide",
          "scroll-smooth",
          // Fade edges
          "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-8 before:bg-gradient-to-r before:from-background before:to-transparent before:pointer-events-none before:z-5",
          "after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:bg-gradient-to-l after:from-background after:to-transparent after:pointer-events-none after:z-5"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {categories.map((item) => (
          <div key={item.name[language] || item.name.en} className="relative flex-shrink-0">
            <Link href={locale === 'sd' ? `/sd${item.href}` : `/en${item.href}`}>
              <Button
                variant="ghost"
                className={cn(
                  "h-9 px-4 text-sm font-medium transition-colors rounded-lg whitespace-nowrap",
                  isActive(item.href)
                    ? 'text-foreground bg-muted/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
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

      {/* Hide scrollbar for webkit browsers */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
