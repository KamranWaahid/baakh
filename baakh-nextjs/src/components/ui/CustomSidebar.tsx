"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Plus, 
  Settings, 
  BarChart3, 
  FileText,
  Menu,
  X,
  BookOpen,
  Type,
  Layers,
  Tag,
  Quote,
  Shield,
  Zap,
  Globe,
  ChevronDown
} from "lucide-react";

// Types
type NavItem = {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  href: string;
};

type QuickAction = { 
  id: string; 
  label: string; 
  selected?: boolean;
  href: string;
};

type LucideIcon = React.ComponentType<{ className?: string; size?: number }>;

// Navigation data - moved outside component to prevent recreation
const navigationItems: NavItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard", description: "Overview & Statistics", href: "/admin" },
  { id: "categories", icon: Layers, label: "Categories", description: "Manage Poetry Categories", href: "/admin/categories" },
  { id: "poets", icon: Users, label: "Poets", description: "Manage Poetry Authors", href: "/admin/poets" },
  { id: "poetry", icon: BookOpen, label: "Poetry", description: "Manage Poetry Works", href: "/admin/poetry" },
  { id: "couplets", icon: Quote, label: "Couplets", description: "Manage Individual Couplets", href: "/admin/poetry/couplets" },
  { id: "tags-poets", icon: Tag, label: "Poet Tags", description: "Manage Poet Tags", href: "/admin/tags/poets" },
  { id: "tags-poetry", icon: Tag, label: "Poetry Tags", description: "Manage Poetry Tags", href: "/admin/tags/poetry" },
  { id: "romanizer", icon: Type, label: "Romanizer", description: "Hesudhar & Romanization Tools", href: "/admin/romanizer" },
  { id: "locations", icon: Globe, label: "Locations", description: "Manage Countries, Provinces & Cities", href: "/admin/locations" },
  { id: "analytics", icon: BarChart3, label: "Analytics", description: "View Statistics & Reports", href: "/admin/analytics" },
  { id: "settings", icon: Settings, label: "Settings", description: "System Configuration", href: "/admin/settings" }
];

// Derived sectioned lists for clearer grouping
const adminItems: NavItem[] = navigationItems.filter(i => i.id === "dashboard");
const contentItems: NavItem[] = navigationItems.filter(i => ["categories","poets","poetry","couplets"].includes(i.id));
const tagsItems: NavItem[] = navigationItems.filter(i => ["tags-poets","tags-poetry"].includes(i.id));
const toolsItems: NavItem[] = navigationItems.filter(i => ["romanizer","locations"].includes(i.id));
const insightsItems: NavItem[] = navigationItems.filter(i => i.id === "analytics");
const systemItems: NavItem[] = navigationItems.filter(i => i.id === "settings");

const quickActions: QuickAction[] = [
  { id: "add-poet", label: "Add Poet", href: "/admin/poets/create" },
  { id: "add-poetry", label: "Add Poetry", href: "/admin/poetry/create" },
  { id: "add-couplet", label: "Add Couplet", href: "/admin/poetry/couplets/create" }
];

// Sidebar Components
const SidebarBrand = () => (
  <div className="px-6 py-5">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 text-[#2B2B2B]">
        <Shield size={24} />
      </div>
      <div className="flex flex-col">
        <h1 className="text-[18px] leading-6 font-semibold text-[#2B2B2B]">Admin</h1>
        <p className="text-[12px] leading-5 font-medium text-[#6B6B6B]">Poetry Archive</p>
      </div>
    </div>
  </div>
);

const SidebarNav = ({ items }: { items: NavItem[] }) => {
  const pathname = usePathname();
  
  return (
    <nav className="flex-1" role="navigation" aria-label="Main navigation">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`
                  group flex items-center gap-3 h-14 px-6 transition-colors duration-200
                  focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(0,0,0,.08)]
                  ${isActive 
                    ? 'rounded-[14px] bg-[#F1F1F1] border border-[#E7E7E7]' 
                    : 'hover:bg-[#F4F4F5]'
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon 
                  size={20} 
                  className={`
                    transition-colors duration-200
                    ${isActive ? 'text-[#2B2B2B]' : 'text-[#6B6B6B]'}
                  `} 
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span 
                    className={`
                      text-[15px] leading-[22px] transition-all duration-200
                      ${isActive ? 'font-semibold text-[#2B2B2B]' : 'font-medium text-[#2B2B2B]'}
                    `}
                  >
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-[13px] leading-[18px] text-[#6B6B6B] truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const SidebarSectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-3">
    <h2 className="text-[11px] leading-4 font-semibold uppercase tracking-wider text-[#9A9A9A]">
      {children}
    </h2>
  </div>
);

const CollapsibleSection = ({ title, items, defaultOpen = true }: { title: string; items: NavItem[]; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#F7F7F7]"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <h2 className="text-[11px] leading-4 font-semibold uppercase tracking-wider text-[#9A9A9A]">
          {title}
        </h2>
        <ChevronDown size={14} className={`text-[#9A9A9A] transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SidebarNav items={items} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarQuickActions = ({ actions }: { actions: QuickAction[] }) => {
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  
  const handleSelect = useCallback((id: string) => {
    setSelectedActions(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);
  
  return (
    <div>
      <SidebarSectionHeader>QUICK ACTIONS</SidebarSectionHeader>
      <div className="space-y-1">
        {actions.map((action) => {
          const isSelected = selectedActions.has(action.id);
          
          return (
            <div key={action.id} className="px-6">
              <button
                onClick={() => handleSelect(action.id)}
                className={`
                  w-full h-12 flex items-center gap-3 px-3 transition-all duration-200
                  focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(0,0,0,.08)]
                  ${isSelected 
                    ? 'bg-[#111111] text-white rounded-md' 
                    : 'hover:bg-[#F4F4F5] text-[#2B2B2B]'
                  }
                  ${!isSelected ? 'text-[#8A8A8A]' : ''}
                `}
                aria-pressed={isSelected}
              >
                <span className="text-[16px] leading-6 font-medium">+</span>
                <span className="text-[16px] leading-6 font-medium">{action.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Footer removed per request

// Main Sidebar Component
interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Memoize event handlers to prevent unnecessary re-renders
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

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 bg-white border border-[#EDEDED] shadow-sm"
          onClick={handleMobileMenuToggle}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Mobile Dialog */}
      <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <DialogContent 
          className="p-0 max-w-[272px] h-full max-h-full rounded-none border-0 shadow-none"
          ref={mobileMenuRef}
        >
          <div className="flex flex-col h-full bg-white">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEDED]">
              <SidebarBrand />
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
            
            {/* Mobile Content */}
            <div className="flex-1 overflow-y-auto">
              <CollapsibleSection title="Admin" items={adminItems} />
              <div className="h-px bg-[#EDEDED] my-2" />
              <CollapsibleSection title="Content Management" items={contentItems} />
              <div className="h-px bg-[#EDEDED] my-2" />
              <CollapsibleSection title="Tags" items={tagsItems} />
              <div className="h-px bg-[#EDEDED] my-2" />
              <CollapsibleSection title="Tools" items={toolsItems} />
              <div className="h-px bg-[#EDEDED] my-2" />
              <CollapsibleSection title="Insights" items={insightsItems} />
              <div className="h-px bg-[#EDEDED] my-2" />
              <CollapsibleSection title="System" items={systemItems} />
              <div className="h-px bg-[#EDEDED] my-2" />
              <SidebarQuickActions actions={quickActions} />
            </div>
            
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden md:flex fixed left-0 top-0 h-full w-[272px] bg-white border-r border-[#EDEDED]
          flex-col z-40
          ${className || ''}
        `}
        role="complementary"
        aria-label="Main navigation sidebar"
      >
        <SidebarBrand />
        <div className="flex-1 overflow-y-auto">
          <CollapsibleSection title="Admin" items={adminItems} />
          <div className="h-px bg-[#EDEDED] my-2" />
          <CollapsibleSection title="Content Management" items={contentItems} />
          <div className="h-px bg-[#EDEDED] my-2" />
          <CollapsibleSection title="Tags" items={tagsItems} />
          <div className="h-px bg-[#EDEDED] my-2" />
          <CollapsibleSection title="Tools" items={toolsItems} />
          <div className="h-px bg-[#EDEDED] my-2" />
          <CollapsibleSection title="Insights" items={insightsItems} />
          <div className="h-px bg-[#EDEDED] my-2" />
          <CollapsibleSection title="System" items={systemItems} />
          <div className="h-px bg-[#EDEDED] my-2" />
          <SidebarQuickActions actions={quickActions} />
        </div>
      </aside>
    </>
  );
} 