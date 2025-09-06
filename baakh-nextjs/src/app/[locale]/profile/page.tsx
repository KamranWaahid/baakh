'use client';

import { useE2EEAuth } from '@/hooks/useE2EEAuth-new';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Edit, Heart, Bookmark, Settings, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProfileTranslations } from '@/lib/profile-translations';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useE2EEAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { language, setLanguage } = useLanguage();
  const t = getProfileTranslations(language);
  const isRTL = language === 'sd';

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    
    setIsLoading(false);
  }, [isAuthenticated, user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push(isRTL ? '/sd' : '/');
  };

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'sd' : 'en';
    setLanguage(newLang);
  };

  const getBackLink = () => {
    return isRTL ? '/sd' : '/';
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get display name - prefer Sindhi name if available, fallback to username
  const getDisplayName = () => {
    if (user.sindhi_name) {
      return user.sindhi_name;
    }
    return user.username || 'User';
  };

  const getDisplayNameWithFont = () => {
    const name = getDisplayName();
    const isSindhiName = user.sindhi_name;
    
    return (
      <span className={isSindhiName ? 'auto-sindhi-font user-name' : ''}>
        {name}
      </span>
    );
  };

  // Get appropriate email display based on locale
  const getEmailDisplay = () => {
    if (isRTL) {
      return `${user.username}@باک.com`;
    }
    return `${user.username}@baakh.com`;
  };

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link 
              href={getBackLink()}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.back}</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.profile}</span>
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLanguageSwitch}
                className="flex items-center gap-2 px-3 py-1 text-sm border-gray-300 hover:border-gray-400"
              >
                <Globe className="w-4 h-4" />
                <span className={isRTL ? 'auto-sindhi-font' : ''}>
                  {language === 'en' ? 'سنڌي' : 'English'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4">
        {/* Profile Header Card */}
        <motion.section 
          className="pt-16 pb-20 bg-white border-b border-gray-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto space-y-10 text-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Profile Avatar */}
              <motion.div 
                className="flex justify-center mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                  <User className="w-16 h-16 text-gray-600" />
                </div>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-serif text-black leading-tight tracking-tight">
                {getDisplayNameWithFont()}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
                <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.welcomeBack}</span>
              </p>
            </motion.div>

            {/* Profile Info */}
            <motion.div 
              className="max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200/50 rounded-[12px] bg-white p-5 flex flex-col items-center justify-center h-[110px]">
                  <Mail className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.email}</span>
                  </p>
                  <p className={`text-lg font-semibold text-gray-900 ${isRTL ? 'auto-sindhi-font' : ''}`}>
                    {getEmailDisplay()}
                  </p>
                </div>
                <div className="border border-gray-200/50 rounded-[12px] bg-white p-5 flex flex-col items-center justify-center h-[110px]">
                  <Calendar className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.memberSince}</span>
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{new Date().getFullYear()}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Profile Content Grid */}
        <div className="pt-16 pb-20">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Personal Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif text-black text-center mb-8">
                <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.personalInformation}</span>
              </h2>
              
              <div className="border border-gray-200/50 rounded-[12px] bg-white p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">
                      <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.username}</span>
                    </span>
                    <span className={`font-medium text-gray-900 ${isRTL ? 'auto-sindhi-font' : ''}`}>
                      {user.username}
                    </span>
                  </div>
                  
                  {user.sindhi_name && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">
                        <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.sindhiName}</span>
                      </span>
                      <span className="font-medium text-gray-900 auto-sindhi-font">
                        {user.sindhi_name}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">
                      <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.userId}</span>
                    </span>
                    <span className="font-mono text-sm text-gray-500">
                      {user.userId.slice(0, 8)}...{user.userId.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">
                      <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.accountType}</span>
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.standard}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Activity Stats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif text-black text-center mb-8">
                <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.activity}</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-gray-200/50 rounded-[12px] bg-white p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">
                    <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.likes}</span>
                  </div>
                </div>
                
                <div className="border border-gray-200/50 rounded-[12px] bg-white p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bookmark className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">
                    <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.bookmarks}</span>
                  </div>
                </div>
                
                <div className="border border-gray-200/50 rounded-[12px] bg-white p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">1</div>
                  <div className="text-sm text-gray-600">
                    <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.profileViews}</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Quick Actions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif text-black text-center mb-8">
                <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.quickActions}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button variant="outline" className="w-full justify-start h-12 px-6 text-base border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-[12px] font-medium bg-white transition-colors duration-200">
                  <Settings className="w-5 h-5 mr-3" />
                  <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.settings}</span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-12 px-6 text-base border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-[12px] font-medium bg-white transition-colors duration-200">
                  <Edit className="w-5 h-5 mr-3" />
                  <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.editProfile}</span>
                </Button>
                
                <Button 
                  onClick={handleLogout}
                  className="w-full h-12 px-6 text-base bg-red-600 text-white hover:bg-red-700 rounded-[12px] font-medium transition-colors duration-200"
                >
                  <User className="w-5 h-5 mr-3" />
                  <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.logout}</span>
                </Button>
              </div>
            </motion.section>

            {/* Account Status */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <div className="border border-gray-200/50 rounded-[12px] bg-white p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.accountActive}</span>
                </h3>
                <p className="text-gray-600 text-sm">
                  <span className={isRTL ? 'auto-sindhi-font' : ''}>{t.e2eeActive}</span>
                </p>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
