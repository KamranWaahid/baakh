"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Heart, 
  Bookmark, 
  Settings, 
  Shield, 
  LogOut,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const { user, isAuthenticated, logout, isLoading: authLoading } = useE2EEAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const isSindhi = locale === 'sd'

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication status
    if (authLoading) {
      return
    }
    
    if (!isAuthenticated) {
      router.push(isSindhi ? '/sd/login' : '/en/login')
      return
    }
    setIsLoading(false)
  }, [isAuthenticated, authLoading, router, isSindhi])

  const handleLogout = () => {
    logout()
    router.push(isSindhi ? '/sd' : '/')
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div 
            className="w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-lg mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className={`text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {isSindhi ? 'لوڊ ٿي رهيو آهي...' : 'Loading...'}
          </p>
        </motion.div>
      </div>
    )
  }

  const username = user?.profile?.name || user?.username || (isSindhi ? 'صارف' : 'User')
  const ChevronIcon = isSindhi ? ChevronLeft : ChevronRight

  return (
    <div className={`min-h-screen bg-white ${isSindhi ? 'dir-rtl' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Avatar with hover tooltip */}
          <div className="relative inline-block mb-6">
            <motion.div
              className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto cursor-pointer relative overflow-hidden border border-gray-200"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <User className="w-8 h-8 text-gray-400" />
            </motion.div>
            
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  className={`absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-gray-700 text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 border border-gray-200 ${isSindhi ? 'auto-sindhi-font' : ''}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSindhi 
                    ? 'رازداري جي ڪري توهان پنهنجي تصوير شامل نٿي ڪري سگهو.'
                    : "You can't add your image due to privacy."
                  }
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-200"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.h1 
            className={`text-3xl font-bold text-gray-900 mb-3 tracking-tight ${isSindhi ? 'auto-sindhi-font' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            {username}
          </motion.h1>
          <motion.p 
            className={`text-gray-500 text-base font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {isSindhi ? 'سندي شاعري جو شوقين' : 'Sindhi Poetry Enthusiast'}
          </motion.p>
        </motion.div>

        {/* Profile Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Likes */}
          <Link href={isSindhi ? "/sd/likes" : "/en/likes"} className="block">
            <Card className="cursor-pointer border border-gray-200 bg-white hover:border-gray-300 transition-colors duration-200">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isSindhi ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isSindhi ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                      <Heart className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className={isSindhi ? 'text-right' : ''}>
                      <h3 className={`font-semibold text-gray-900 text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'پسند' : 'Likes'}
                      </h3>
                      <p className={`text-sm text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'شاعري جيڪا توهان کي پسند آهي' : "Poems you've liked"}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${isSindhi ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <span className="text-2xl font-bold text-gray-900">0</span>
                    <ChevronIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Bookmarks */}
          <Link href={isSindhi ? "/sd/bookmarks" : "/en/bookmarks"} className="block">
            <Card className="cursor-pointer border border-gray-200 bg-white hover:border-gray-300 transition-colors duration-200">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isSindhi ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isSindhi ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                      <Bookmark className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className={isSindhi ? 'text-right' : ''}>
                      <h3 className={`font-semibold text-gray-900 text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'نشانيون' : 'Bookmarks'}
                      </h3>
                      <p className={`text-sm text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'شاعري جيڪا توهان محفوظ ڪئي آهي' : "Poems you've saved"}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${isSindhi ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <span className="text-2xl font-bold text-gray-900">0</span>
                    <ChevronIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Settings */}
          <Link href={isSindhi ? "/sd/settings" : "/en/settings"} className="block">
            <Card className="cursor-pointer border border-gray-200 bg-white hover:border-gray-300 transition-colors duration-200">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isSindhi ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isSindhi ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                      <Settings className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className={isSindhi ? 'text-right' : ''}>
                      <h3 className={`font-semibold text-gray-900 text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'سيٽنگون' : 'Settings'}
                      </h3>
                      <p className={`text-sm text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'پنهنجي ترجيحون منظم ڪريو' : 'Manage your preferences'}
                      </p>
                    </div>
                  </div>
                  <ChevronIcon className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Privacy */}
          <Link href={isSindhi ? "/sd/privacy" : "/en/privacy"} className="block">
            <Card className="cursor-pointer border border-gray-200 bg-white hover:border-gray-300 transition-colors duration-200">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isSindhi ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isSindhi ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                      <Shield className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className={isSindhi ? 'text-right' : ''}>
                      <h3 className={`font-semibold text-gray-900 text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'رازداري' : 'Privacy'}
                      </h3>
                      <p className={`text-sm text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'پنهنجي ڊيٽا ۽ رازداري کي کنٽرول ڪريو' : 'Control your data and privacy'}
                      </p>
                    </div>
                  </div>
                  <ChevronIcon className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Logout Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
        >
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 px-8 py-3 rounded-xl font-medium transition-colors duration-200 bg-white"
          >
            <LogOut className={`w-4 h-4 ${isSindhi ? 'ml-2' : 'mr-2'}`} />
            <span className={isSindhi ? 'auto-sindhi-font' : ''}>
              {isSindhi ? 'خارج ٿيو' : 'Sign Out'}
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}