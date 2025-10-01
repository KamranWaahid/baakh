"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Settings, Heart, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/ui/logo";
import { useE2EEAuth } from "@/hooks/useE2EEAuth";
import Image from "next/image";

const navigationItems = [
  {
    name: { en: "Poets", sd: "شاعر" },
    href: "/poets"
  },
  {
    name: { en: "Poetry", sd: "شاعري" },
    href: "/poetry"
  },
  {
    name: { en: "Couplets", sd: "شعر" },
    href: "/couplets"
  },
  {
    name: { en: "Categories", sd: "صنفون" },
    href: "/categories"
  },
  {
    name: { en: "Topics", sd: "موضوع" },
    href: "/topics"
  },
  {
    name: { en: "Timeline", sd: "دور" },
    href: "/timeline"
  }
];

export default function MainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useE2EEAuth();
  
  // Detect locale from pathname
  const locale = pathname.startsWith('/sd') ? 'sd' : 'en';
  const isRTL = locale === 'sd';
  const displayLanguage = isRTL ? 'sd' as const : 'en' as const;

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAvatarMenuOpen(false);
  }, [pathname]);

  // Close avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isAvatarMenuOpen && !target.closest('.avatar-menu-container')) {
        setIsAvatarMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAvatarMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setIsAvatarMenuOpen(false);
    // Redirect to home page
    window.location.href = isRTL ? '/sd' : '/en';
  };

  // Get display name - prefer Sindhi name if available, fallback to username
  const getDisplayName = () => {
    if (user?.sindhi_name) {
      return user.sindhi_name;
    }
    return user?.username || 'User';
  };

  // Get display name with proper font class
  const getDisplayNameWithFont = () => {
    const name = getDisplayName();
    const isSindhiName = user?.sindhi_name;
    
    return (
      <span className={isSindhiName ? 'auto-sindhi-font user-name' : ''}>
        {name}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200/50 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href={isRTL ? "/sd" : "/en"} className="flex-shrink-0">
              <Image 
                src="/Baakh.svg" 
                alt="Baakh" 
                width={32}
                height={32}
                className="h-8 w-auto dark:brightness-0 dark:invert" 
                priority
              />
            </Link>
            
          </div>

          {/* Center - Desktop Navigation */}
          <div className="hidden lg:flex flex-1 items-center justify-center" aria-label="Main">
            <nav className="flex items-center gap-2">
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name[displayLanguage]}
                    href={isRTL ? `/sd${item.href}` : `/en${item.href}`}
                    className={
                      `px-3 py-2 rounded-md text-sm transition-colors ` +
                      (active
                        ? `text-gray-900 font-semibold dark:text-neutral-100`
                        : `text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-neutral-100`)
                    }
                  >
                    <span className={displayLanguage === 'sd' ? 'auto-sindhi-font nav-text' : ''}>
                      {item.name[displayLanguage]}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side - Language, Theme, and User Avatar */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Avatar or Login Button */}
            {isAuthenticated ? (
              <div className="relative avatar-menu-container">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 transition-colors duration-200"
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  aria-label="User menu"
                >
                  <User className="w-5 h-5" />
                </Button>

                {/* Avatar Dropdown Menu */}
                <AnimatePresence>
                  {isAvatarMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8, filter: "blur(8px)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, y: -8, filter: "blur(8px)" }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30,
                        duration: 0.3
                      }}
                      className={`absolute ${isRTL ? 'left-4' : 'right-4'} mt-3 w-64 bg-white/95 backdrop-blur-xl border border-gray-100/50 rounded-xl shadow-lg shadow-gray-900/5 z-50 overflow-hidden`}
                    >
                      {/* User Info Section */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="px-6 py-6 border-b border-gray-100/30"
                      >
                        <div className="flex items-center gap-3">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="h-11 w-11 rounded-full bg-gray-50/50 flex items-center justify-center ring-1 ring-gray-100/30"
                          >
                            <User className="w-5 h-5 text-gray-400" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <motion.p 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15, duration: 0.2 }}
                              className="text-sm font-medium text-gray-900 leading-tight"
                            >
                              {getDisplayNameWithFont()}
                            </motion.p>
                            <motion.p 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2, duration: 0.2 }}
                              className="text-xs text-gray-500 mt-0.5"
                            >
                              {isRTL ? 'خوش آمديد' : 'Welcome back'}
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Menu Items Section */}
                      <div className="py-2">
                        <div className="px-3 space-y-1">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25, duration: 0.2 }}
                          >
                            <Link href={isRTL ? "/sd/dashboard" : "/en/dashboard"}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-12 px-5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                                onClick={() => setIsAvatarMenuOpen(false)}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className="w-8 h-8 flex items-center justify-center mr-4"
                                >
                                  <User className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                                </motion.div>
                                <span className={isRTL ? 'auto-sindhi-font' : ''}>
                                  {isRTL ? 'پروفائل' : 'Profile'}
                                </span>
                              </Button>
                            </Link>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.2 }}
                          >
                            <Link href={isRTL ? "/sd/likes" : "/en/likes"}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-12 px-5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                                onClick={() => setIsAvatarMenuOpen(false)}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: -5 }}
                                  className="w-8 h-8 flex items-center justify-center mr-4"
                                >
                                  <Heart className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                                </motion.div>
                                <span className={isRTL ? 'auto-sindhi-font' : ''}>
                                  {isRTL ? 'پسنديده' : 'Likes'}
                                </span>
                              </Button>
                            </Link>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35, duration: 0.2 }}
                          >
                            <Link href={isRTL ? "/sd/bookmarks" : "/en/bookmarks"}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-12 px-5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                                onClick={() => setIsAvatarMenuOpen(false)}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 3 }}
                                  className="w-8 h-8 flex items-center justify-center mr-4"
                                >
                                  <Bookmark className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                                </motion.div>
                                <span className={isRTL ? 'auto-sindhi-font' : ''}>
                                  {isRTL ? 'نشانيون' : 'Bookmarks'}
                                </span>
                              </Button>
                            </Link>
                          </motion.div>
                        </div>

                        {/* Seamless Divider */}
                        <motion.div 
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
                          className="border-t border-gray-100/40 my-3 mx-3"
                        />

                        {/* Logout Section */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45, duration: 0.2 }}
                          className="px-3"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-12 px-5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                            onClick={handleLogout}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: -3 }}
                              className="w-8 h-8 flex items-center justify-center mr-4"
                            >
                              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                            </motion.div>
                            <span className={isRTL ? 'auto-sindhi-font' : ''}>
                              {isRTL ? 'خارج ٿيو' : 'Logout'}
                            </span>
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href={isRTL ? "/sd/login" : "/en/login"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 rounded-full hover:bg-muted/50 dark:hover:bg-neutral-800"
                  aria-label={isRTL ? "داخل ٿيو" : "Sign in"}
                >
                  <User className="w-4 h-4 mr-2" />
                  {isRTL ? (
                    <span className="auto-sindhi-font">داخل ٿيو</span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <motion.div
              whileHover={{ 
                scale: 1.05,
                rotate: 2
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17 
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-9 w-9 p-0 rounded-lg hover:bg-muted/50 dark:hover:bg-neutral-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }}
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ 
                opacity: 0,
                height: 0,
                y: -20
              }}
              animate={{ 
                opacity: 1,
                height: "auto",
                y: 0
              }}
              exit={{ 
                opacity: 0,
                height: 0,
                y: -20
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3
              }}
              className="lg:hidden border-t border-gray-200/50 bg-white dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden"
            >
              <motion.nav 
                className="py-4 space-y-1 px-4" 
                aria-label="Mobile navigation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {navigationItems.map((item, index) => (
                  <motion.div 
                    key={item.name[displayLanguage]}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ 
                      delay: 0.15 + (index * 0.05),
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    <Link href={isRTL ? `/sd${item.href}` : `/en${item.href}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-center h-11 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg dark:text-neutral-300 dark:hover:text-neutral-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className={displayLanguage === 'sd' ? 'auto-sindhi-font nav-text' : ''}>
                          {item.name[displayLanguage]}
                        </span>
                      </Button>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Secondary Actions */}
                <motion.div 
                  className="pt-4 border-t border-gray-200/50 space-y-2 dark:border-neutral-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200/20 dark:border-neutral-700/50 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                              {getDisplayNameWithFont()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-neutral-400">
                              {isRTL ? 'خوش آمديد' : 'Welcome back'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Link href={isRTL ? "/sd/likes" : "/en/likes"}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-10 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4 mr-3" />
                          <span className={displayLanguage === 'sd' ? 'auto-sindhi-font' : ''}>
                            {isRTL ? 'پسنديده' : 'Likes'}
                          </span>
                        </Button>
                      </Link>

                      <Link href={isRTL ? "/sd/bookmarks" : "/en/bookmarks"}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-10 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Bookmark className="w-4 h-4 mr-3" />
                          <span className={displayLanguage === 'sd' ? 'auto-sindhi-font' : ''}>
                            {isRTL ? 'نشانيون' : 'Bookmarks'}
                          </span>
                        </Button>
                      </Link>

                      <div className="border-t border-gray-200/20 dark:border-neutral-700/50 my-2" />

                      <Button
                        variant="ghost"
                        className="w-full justify-start h-10 px-4 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span className={displayLanguage === 'sd' ? 'auto-sindhi-font' : ''}>
                          {isRTL ? 'خارج ٿيو' : 'Logout'}
                        </span>
                      </Button>
                    </>
                  ) : (
                    <Link href={isRTL ? "/sd/login" : "/en/login"}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-10 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        <span className={displayLanguage === 'sd' ? 'auto-sindhi-font' : ''}>
                          {isRTL ? 'داخل ٿيو' : 'Sign In'}
                        </span>
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </header>
  );
}
