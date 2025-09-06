"use client";

import React from "react";

type BreadcrumbNavigationProps = {
  items?: Array<{ label: string; href?: string }>;
  className?: string;
};

export default function BreadcrumbNavigation({ items = [], className = "" }: BreadcrumbNavigationProps) {
  if (!items.length) return null;
  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span className="opacity-60">/</span>}
            {item.href ? (
              <a href={item.href} className="hover:underline">
                {item.label}
              </a>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}


