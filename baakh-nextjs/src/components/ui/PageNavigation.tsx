"use client";

import React from "react";
import { Button } from "./button";

type PageNavigationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function PageNavigation({ currentPage, totalPages, onPageChange, className = "" }: PageNavigationProps) {
  if (totalPages <= 1) return null;
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="outline" disabled={prevDisabled} onClick={() => onPageChange(currentPage - 1)}>
        Prev
      </Button>
      <span className="text-sm">
        {currentPage} / {totalPages}
      </span>
      <Button variant="outline" disabled={nextDisabled} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </Button>
    </div>
  );
}


