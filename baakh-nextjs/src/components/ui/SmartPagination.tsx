"use client";

import { Button } from '@/components/ui/button';
import { NumberFont } from '@/components/ui/NumberFont';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isRTL?: boolean;
  className?: string;
}

export default function SmartPagination({
  currentPage,
  totalPages,
  onPageChange,
  isRTL = false,
  className = ""
}: SmartPaginationProps) {
  // Calculate which page numbers to show
  const getVisiblePages = () => {
    // More conservative approach for mobile - show fewer pages
    const maxVisible = 3; // Maximum pages to show on mobile
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination logic - more mobile-friendly
      if (currentPage <= 2) {
        // Show first 3 pages + last page
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        if (totalPages > 3) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 1) {
        // Show first page + last 3 pages
        pages.push(1);
        if (totalPages > 3) {
          pages.push('...');
        }
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + current range + last page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex justify-center items-center gap-1 sm:gap-2 overflow-x-auto ${className}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 sm:h-9 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-full px-2 sm:px-3 disabled:opacity-50 flex-shrink-0"
      >
        <span className="font-medium font-inter">
          {isRTL ? <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
        </span>
      </Button>
      
      <div className="flex gap-1 sm:gap-2">
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="h-8 sm:h-9 min-w-8 sm:min-w-9 px-2 sm:px-3 rounded-full flex items-center justify-center text-xs sm:text-sm text-gray-500 font-inter">
                ...
              </span>
            ) : (
              <Button
                variant={page === currentPage ? 'default' : 'outline'}
                onClick={() => onPageChange(page as number)}
                className={`h-8 sm:h-9 min-w-8 sm:min-w-9 px-2 sm:px-3 rounded-full font-normal text-xs sm:text-sm font-inter ${
                  page === currentPage
                    ? 'bg-black hover:bg-gray-800 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <NumberFont>
                  {page}
                </NumberFont>
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 sm:h-9 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-full px-2 sm:px-3 disabled:opacity-50 flex-shrink-0"
      >
        <span className="font-medium font-inter">
          {isRTL ? <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
        </span>
      </Button>
    </div>
  );
}
