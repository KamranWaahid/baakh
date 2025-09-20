"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { 
  Home, 
  Users, 
  BookOpen, 
  Quote, 
  Tag, 
  Type, 
  Globe, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Plus,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Shield,
  History,
  Flag
} from "lucide-react";

// Types
type NavItem = {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  href: string;
  badge?: string;
  matchPrefixes?: string[];
  excludePrefixes?: string[];
};

// Simplified navigation structure
const navigationItems: NavItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard", href: "/admin" },
  { id: "poets", icon: Users, label: "Poets", href: "/admin/poets" },
  { id: "poetry", icon: BookOpen, label: "Poetry", href: "/admin/poetry", excludePrefixes: ["/admin/poetry/couplets"] },
  { id: "couplets", icon: Quote, label: "Couplets", href: "/admin/poetry/couplets" },
  { id: "timeline", icon: History, label: "Timeline", href: "/admin/timeline" },
  { id: "tags", icon: Tag, label: "Tags", href: "/admin/tags", matchPrefixes: ["/admin/tags/poets", "/admin/tags/create", "/admin/tags"] },
  { id: "romanizer", icon: Type, label: "Romanizer", href: "/admin/romanizer" },
  { id: "locations", icon: Globe, label: "Locations", href: "/admin/locations" },
  { id: "reports", icon: Flag, label: "Reports", href: "/admin/reports" },
  { id: "analytics", icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { id: "security", icon: Shield, label: "Security", href: "/admin/security", badge: "New" },
  { id: "documentation", icon: HelpCircle, label: "Documentation", href: "/admin/documentation" },
  { id: "settings", icon: Settings, label: "Settings", href: "/admin/settings" }
];

const quickActions = [
  { id: "add-poet", label: "New Poet", href: "/admin/poets/create", icon: Plus },
  { id: "add-poetry", label: "New Poetry", href: "/admin/poetry/create", icon: Plus },
  { id: "add-couplet", label: "New Couplet", href: "/admin/poetry/couplets/create", icon: Plus }
];

// Sidebar Components
const SidebarBrand = () => (
  <div className="px-4 py-6">
    <div className="flex items-center gap-3">
      <Logo size="md" className="text-gray-900" />
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">Baakh</h1>
        <p className="text-xs text-gray-500 leading-tight -mt-1">Poetry Archive</p>
      </div>
    </div>
  </div>
);

const NavItem = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={`
        group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
        hover:bg-gray-50 focus:outline-none
        ${isActive 
          ? 'bg-gray-100 text-gray-900' 
          : 'text-gray-700 hover:text-gray-900'
        }
      `}
    >
      <Icon 
        size={18} 
        className={`
          transition-colors duration-200
          ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}
        `} 
      />
      <span className="text-sm font-medium flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
      {isActive && (
        <ChevronRight size={14} className="text-gray-900" />
      )}
    </Link>
  );
};

const QuickAction = ({ action }: { action: typeof quickActions[0] }) => {
  const Icon = action.icon;
  
  return (
    <Link
      href={action.href}
      className="group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 focus:outline-none"
    >
      <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center group-hover:bg-gray-300 transition-colors">
        <Icon size={12} className="text-gray-700" />
      </div>
      <span className="text-sm font-medium">{action.label}</span>
    </Link>
  );
};

// Main Sidebar Component
interface MinimalSidebarProps {
  className?: string;
}

export default function MinimalSidebar({ className }: MinimalSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <SidebarBrand />
      
      <div className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          {navigationItems.map((item) => {
            const directActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const matchedByPrefix = item.matchPrefixes?.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/')) || false;
            const excludedByPrefix = item.excludePrefixes?.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/')) || false;
            const isActive = (directActive || matchedByPrefix) && !excludedByPrefix;
            return (
              <NavItem key={item.id} item={item} isActive={isActive} />
            );
          })}
        </nav>

      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
          onClick={handleMobileMenuToggle}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Mobile Dialog */}
      <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <DialogContent 
          className="p-0 max-w-[280px] h-full max-h-full rounded-none border-0 shadow-xl"
          ref={mobileMenuRef}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleMobileMenuClose}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </Button>
          </div>
          <SidebarContent />
        </DialogContent>
      </Dialog>

      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-white border-r border-gray-200
          flex-col z-40 shadow-sm
          ${className || ''}
        `}
        role="complementary"
        aria-label="Main navigation sidebar"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
