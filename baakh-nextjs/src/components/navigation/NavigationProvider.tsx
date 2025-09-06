"use client";

import { ReactNode } from "react";
import MainNavigation from "../ui/MainNavigation";

interface NavigationProviderProps {
  children: ReactNode;
}

export default function NavigationProvider({ children }: NavigationProviderProps) {
  return (
    <>
      <MainNavigation />
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
