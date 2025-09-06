"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

type TabsProps = {
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
  children: React.ReactNode;
};

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = {
  className?: string;
  children: React.ReactNode;
};

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-muted/50 p-1",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

type TabsTriggerProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

export function TabsTrigger({ value, className, children, disabled = false }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      onClick={() => {
        if (disabled) return;
        ctx.onValueChange(value);
      }}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
      type="button"
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
};

export function TabsContent({ value, className, children }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");

  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={cn("mt-4", className)}>
      {children}
    </div>
  );
}


