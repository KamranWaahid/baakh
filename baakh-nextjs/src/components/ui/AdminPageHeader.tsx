"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: ReactNode;
  subtitleIcon?: ReactNode;
}

export default function AdminPageHeader({ title, subtitle, description, action, subtitleIcon }: AdminPageHeaderProps) {
  return (
    <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4">
          {subtitle && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                {subtitleIcon && <span className="mr-2">{subtitleIcon}</span>}
                {subtitle}
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#1F1F1F]">{title}</h1>
              {description && <p className="text-lg text-[#6B6B6B] max-w-2xl">{description}</p>}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


