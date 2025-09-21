"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Database, 
  Key, 
  Users, 
  Heart, 
  Bookmark, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Info
} from 'lucide-react'

export default function PrivacyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showEncryptedData, setShowEncryptedData] = useState(false)
  const [hideEnglishName, setHideEnglishName] = useState(false)
  const [hideSindhiName, setHideSindhiName] = useState(false)
  const [hideUsername, setHideUsername] = useState(false)
  const [encryptedData, setEncryptedData] = useState<Record<string, unknown> | null>(null)
  const [dataSource, setDataSource] = useState<'server' | 'cache' | null>(null)
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

  useEffect(() => {
    if (user && isAuthenticated) {
      // Get encrypted data to show user - check both possible localStorage keys
      let userData = localStorage.getItem('e2ee_user_data')
      if (!userData) {
        userData = localStorage.getItem('e2ee_user')
      }
      
      if (userData) {
        try {
          const parsed = JSON.parse(userData)
          console.log('Loaded user data from localStorage:', parsed)
          setEncryptedData(parsed)
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      } else {
        console.warn('No user data found in localStorage')
      }
    }
  }, [user, isAuthenticated])

  const handleShowEncryptedData = async () => {
    if (!showEncryptedData) {
      // Fetch fresh data from server when showing
      try {
        // Get JWT token from localStorage
        const token = localStorage.getItem('e2ee_jwt_token')
        
        if (!token) {
          console.warn('No JWT token found, using cached data from localStorage')
          // Fallback to localStorage data - check both possible keys
          let userData = localStorage.getItem('e2ee_user_data')
          if (!userData) {
            userData = localStorage.getItem('e2ee_user')
          }
          
          if (userData) {
            try {
              const parsed = JSON.parse(userData)
              console.log('Using cached data from localStorage:', parsed)
              setEncryptedData(parsed)
              setDataSource('cache')
            } catch (e) {
              console.error('Error parsing user data:', e)
            }
          } else {
            console.warn('No cached user data found in localStorage')
          }
          setShowEncryptedData(true)
          return
        }

        const response = await fetch('/api/auth/user-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setEncryptedData(result.data)
            setDataSource('server')
          } else {
            console.warn('API error:', result.message, '- falling back to cached data')
            // Fallback to localStorage data - check both possible keys
            let userData = localStorage.getItem('e2ee_user_data')
            if (!userData) {
              userData = localStorage.getItem('e2ee_user')
            }
            
            if (userData) {
              try {
                const parsed = JSON.parse(userData)
                setEncryptedData(parsed)
                setDataSource('cache')
              } catch (e) {
                console.error('Error parsing user data:', e)
              }
            } else {
              console.warn('No cached user data available for fallback')
            }
          }
        } else {
          console.warn('HTTP error:', response.status, '- falling back to cached data')
          // Fallback to localStorage data - check both possible keys
          let userData = localStorage.getItem('e2ee_user_data')
          if (!userData) {
            userData = localStorage.getItem('e2ee_user')
          }
          
          if (userData) {
            try {
              const parsed = JSON.parse(userData)
              setEncryptedData(parsed)
              setDataSource('cache')
            } catch (e) {
              console.error('Error parsing user data:', e)
            }
          } else {
            console.warn('No cached user data available for fallback')
          }
        }
      } catch (error) {
        console.warn('Error fetching encrypted data:', error, '- falling back to cached data')
        // Fallback to localStorage data - check both possible keys
        let userData = localStorage.getItem('e2ee_user_data')
        if (!userData) {
          userData = localStorage.getItem('e2ee_user')
        }
        
        if (userData) {
          try {
            const parsed = JSON.parse(userData)
            setEncryptedData(parsed)
            setDataSource('cache')
          } catch (e) {
            console.error('Error parsing user data:', e)
          }
        } else {
          console.warn('No cached user data available for fallback')
        }
      }
    }
    setShowEncryptedData(!showEncryptedData)
  }

  const handleLogout = () => {
    logout()
    router.push(isSindhi ? '/sd' : '/')
  }

  const handleBackToDashboard = () => {
    router.push(isSindhi ? '/sd/dashboard' : '/en/dashboard')
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

  const ChevronIcon = isSindhi ? ChevronLeft : ChevronRight

  return (
    <div className={`min-h-screen bg-white ${isSindhi ? 'dir-rtl' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
            <motion.div
          className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="border border-gray-200 hover:border-gray-300 bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors duration-200"
            >
              <ArrowLeft className={`w-4 h-4 ${isSindhi ? 'ml-2' : 'mr-2'}`} />
              <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                {isSindhi ? 'واپس' : 'Back'}
              </span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                <Shield className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'رازداري ۽ حفاظت' : 'Privacy & Security'}
              </h1>
                <p className={`text-gray-500 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'توهان جي ڊيٽا جي حفاظت ۽ ڪيئن اسان توهان جي رازداري کي محفوظ رکون ٿا' : 'How we protect your data and maintain your privacy'}
                </p>
              </div>
                      </div>
              </div>
            </motion.div>

        {/* E2EE Explanation */}
            <motion.div
          className="mb-8"
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                  <Lock className="w-6 h-6 text-gray-500" />
              </div>
                <div className="flex-1">
                  <h2 className={`text-xl font-bold text-gray-900 mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'اينڊ-ٽو-اينڊ انڪريپشن (E2EE)' : 'End-to-End Encryption (E2EE)'}
              </h2>
                  <div className={`space-y-4 text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    <p>
                      {isSindhi 
                        ? 'اسان توهان جي سڀ ڊيٽا کي اينڊ-ٽو-اينڊ انڪريپشن سان محفوظ رکون ٿا. اها مطلب آهي تہ توهان جي ڊيٽا صرف توهان جي پاسورڊ سان ڪريپٽ ٿيل آهي ۽ اسان کي به ان کي پڙهڻ جي اجازت ناهي.'
                        : 'We protect all your data with end-to-end encryption. This means your data is encrypted with your password only, and even we cannot read it.'
                      }
                    </p>
                    <p>
                      {isSindhi 
                        ? 'توهان جي پاسورڊ کان هڪ ماسٽر ڪي ٺاهي وڃي ٿي، جيڪا توهان جي سڀ ڊيٽا کي انڪريپٽ ڪري ٿي. اها ڪي صرف توهان جي ڊوائيس تي موجود آهي ۽ ڪنهن به سرور تي محفوظ ناهي.'
                        : 'A master key is derived from your password, which encrypts all your data. This key only exists on your device and is never stored on any server.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            </motion.div>

        {/* Why We Store Data */}
            <motion.div
          className="mb-8"
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                  <Database className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl font-bold text-gray-900 mb-3 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'ڇو اسان ڊيٽا محفوظ ڪريون ٿا؟' : 'Why Do We Store Data?'}
              </h2>
                  <div className={`space-y-4 text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    <p>
                      {isSindhi 
                        ? 'باک هڪ غير منافع بخش منصوبو آهي جيڪو رضاکارن طرفان چلائي وڃي ٿو. اسان صرف هي ڊيٽا محفوظ ڪريون ٿا:'
                        : 'Baakh is a non-profit project run by volunteers. We only store this data:'
                      }
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-gray-500" />
                        <span>
                          {isSindhi 
                            ? 'پسنديده شاعري (توهان جي پسنديده شاعري جي فهرست)'
                            : 'Liked Poetry (list of poems you have liked)'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Bookmark className="w-5 h-5 text-gray-500" />
                        <span>
                          {isSindhi 
                            ? 'نشانيون (توهان جي محفوظ ڪيل شاعري)'
                            : 'Bookmarks (poems you have saved)'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-gray-500" />
                        <span>
                          {isSindhi 
                            ? 'ڏسڻ جي تاريخ (توهان ڪهڙي شاعري ڏسي آهي)'
                            : 'View History (which poems you have viewed)'
                          }
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      {isSindhi 
                        ? 'اها سڀ ڊيٽا توهان جي تجربو بهتر بڻائڻ لاءِ آهي ۽ اسان کي ڪنهن به قسم جي منافع حاصل ناهي.'
                        : 'This data is only to improve your experience and we do not profit from it in any way.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Controls */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        >
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <Shield className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-semibold text-gray-900 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'رازداري جي ترتيبون' : 'Privacy Controls'}
                  </h2>
                  <div className="space-y-3">
                    {/* Hide English Name */}
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                          <EyeOff className="w-3 h-3 text-gray-500" />
                        </div>
                        <div>
                          <h3 className={`text-sm font-medium text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {isSindhi ? 'انگريزي نالو لڪايو' : 'Hide English Name'}
                          </h3>
                          <p className={`text-xs text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {isSindhi ? 'انگريزي نالو انڪريپٽ ڪريو' : 'Encrypt English name'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setHideEnglishName(!hideEnglishName)}
                        variant="outline"
                        className={`border ${hideEnglishName ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200'} px-3 py-1.5 rounded-md transition-colors duration-200`}
                      >
                        {hideEnglishName ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                    </div>

                    {/* Hide Sindhi Name */}
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                          <EyeOff className="w-3 h-3 text-gray-500" />
                        </div>
                        <div>
                          <h3 className={`text-sm font-medium text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {isSindhi ? 'سنڌي نالو لڪايو' : 'Hide Sindhi Name'}
                          </h3>
                          <p className={`text-xs text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {isSindhi ? 'سنڌي نالو انڪريپٽ ڪريو' : 'Encrypt Sindhi name'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setHideSindhiName(!hideSindhiName)}
                        variant="outline"
                        className={`border ${hideSindhiName ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200'} px-3 py-1.5 rounded-md transition-colors duration-200`}
                      >
                        {hideSindhiName ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                    </div>

                    {/* Hide Username */}
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                          <Users className="w-3 h-3 text-gray-500" />
                        </div>
                        <div>
                          <h3 className={`text-sm font-medium text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {isSindhi ? 'صارف نالو لڪايو' : 'Hide Username'}
                          </h3>
                          <p className={`text-xs text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {isSindhi ? 'صارف نالو انڪريپٽ ڪريو' : 'Encrypt username'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setHideUsername(!hideUsername)}
                        variant="outline"
                        className={`border ${hideUsername ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200'} px-3 py-1.5 rounded-md transition-colors duration-200`}
                      >
                        {hideUsername ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Encrypted Data Display */}
            <motion.div
          className="mb-8"
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
        >
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                  <Eye className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {isSindhi ? 'توهان جي انڪريپٽ ڊيٽا' : 'Your Encrypted Data'}
                    </h2>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={handleShowEncryptedData}
                        variant="outline"
                        className="border border-gray-200 hover:border-gray-300 bg-white text-gray-600 hover:text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <motion.div
                          className="flex items-center"
                          initial={false}
                          animate={{ 
                            opacity: showEncryptedData ? 0.8 : 1,
                            scale: showEncryptedData ? 0.95 : 1
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {showEncryptedData ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              {isSindhi ? 'لڪايو' : 'Hide'}
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              {isSindhi ? 'ڏيکاريو' : 'Show'}
                            </>
                          )}
                        </motion.div>
                      </Button>
                    </motion.div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {showEncryptedData ? (
                      <motion.div
                        key="encrypted-data"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          duration: 0.4, 
                          ease: "easeOut",
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                      >
                        <motion.div 
                          className="space-y-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          {/* Information Banner */}
                          <motion.div 
                            className="p-4 bg-gray-50 border border-gray-100 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                          >
                            <div className="flex items-start gap-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.3, type: "spring" }}
                                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"
                              >
                                <Info className="w-4 h-4 text-gray-600" />
                              </motion.div>
                              <motion.p 
                                className={`text-sm text-gray-600 leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.3 }}
                              >
                                {isSindhi 
                                  ? 'اها ڊيٽا توهان جي پاسورڊ سان انڪريپٽ ٿيل آهي. صرف توهان ان کي پڙهي سگهو ٿا.'
                                  : 'This data is encrypted with your password. Only you can read it.'
                                }
                              </motion.p>
                            </div>
                          </motion.div>

                          {/* Data Source Indicator */}
                          {dataSource && (
                            <motion.div 
                              className={`p-3 rounded-xl border ${
                                dataSource === 'server' 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-yellow-50 border-yellow-200'
                              }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.3 }}
                            >
                              <div className="flex items-center gap-2">
                                <motion.div
                                  animate={{ rotate: dataSource === 'server' ? 0 : 360 }}
                                  transition={{ duration: 0.5 }}
                                  className={`w-4 h-4 rounded-full ${
                                    dataSource === 'server' ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}
                                />
                                <p className={`text-sm font-medium ${
                                  dataSource === 'server' ? 'text-green-700' : 'text-yellow-700'
                                } ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {dataSource === 'server' 
                                    ? (isSindhi ? 'تازو ڊيٽا سرور کان موصول ٿيو' : 'Fresh data from server')
                                    : (isSindhi ? 'ڪيڪ ڊيٽا استعمال ٿي رهي آهي' : 'Using cached data')
                                  }
                                </p>
                              </div>
                            </motion.div>
                          )}

                          {/* User Information */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                          >
                            <h4 className={`font-semibold text-gray-800 mb-3 text-sm ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? 'صارف جي معلومات' : 'User Information'}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'صارف آئي ڊي:' : 'User ID:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5, duration: 0.3 }}
                                >
                                  {encryptedData?.user_id || encryptedData?.userId || 'N/A'}
                                </motion.code>
                              </div>
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'صارف نالو:' : 'Username:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.6, duration: 0.3 }}
                                >
                                  {hideUsername ? '🔒 [ENCRYPTED]' : (encryptedData?.username || 'N/A')}
                                </motion.code>
                              </div>
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'سنڌي نالو:' : 'Sindhi Name:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.7, duration: 0.3 }}
                                >
                                  {hideSindhiName ? '🔒 [ENCRYPTED]' : (encryptedData?.sindhi_name || encryptedData?.profile?.sindhi_name || 'N/A')}
                                </motion.code>
                              </div>
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'انگريزي نالو:' : 'English Name:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.8, duration: 0.3 }}
                                >
                                  {hideEnglishName ? '🔒 [ENCRYPTED]' : (encryptedData?.english_name || encryptedData?.profile?.name || 'N/A')}
                                </motion.code>
                              </div>
                            </div>
                          </motion.div>

                          {/* Password Data */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                          >
                            <h4 className={`font-semibold text-gray-800 mb-3 text-sm ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? 'پاسورڊ ڊيٽا' : 'Password Data'}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'پاسورڊ سيلٽ:' : 'Password Salt:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5, duration: 0.3 }}
                                >
                                  {encryptedData?.password_salt || encryptedData?.passwordSalt || 'N/A'}
                                </motion.code>
                              </div>
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'پاسورڊ ويريفائر:' : 'Password Verifier:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.6, duration: 0.3 }}
                                >
                                  {encryptedData?.password_verifier || encryptedData?.passwordVerifier || 'N/A'}
                                </motion.code>
                              </div>
                            </div>
                          </motion.div>

                          {/* Profile Encryption */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                          >
                            <h4 className={`font-semibold text-gray-800 mb-3 text-sm ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? 'پروفائل انڪريپشن' : 'Profile Encryption'}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'پروفائل سائيفر:' : 'Profile Cipher:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.6, duration: 0.3 }}
                                >
                                  {encryptedData?.profile_cipher || encryptedData?.profileCipher || 'N/A'}
                                </motion.code>
                              </div>
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'پروفائل نانس:' : 'Profile Nonce:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.7, duration: 0.3 }}
                                >
                                  {encryptedData?.profile_nonce || encryptedData?.profileNonce || 'N/A'}
                                </motion.code>
                              </div>
                            </div>
                          </motion.div>

                          {/* Master Key Encryption */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7, duration: 0.3 }}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                          >
                            <h4 className={`font-semibold text-gray-800 mb-3 text-sm ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? 'ماسٽر ڪي انڪريپشن' : 'Master Key Encryption'}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'ماسٽر ڪي سائيفر:' : 'Master Key Cipher:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.7, duration: 0.3 }}
                                >
                                  {encryptedData?.master_key_cipher || encryptedData?.masterKeyCipher || 'N/A'}
                                </motion.code>
                              </div>
                              <div>
                                <p className={`text-xs text-gray-500 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                  {isSindhi ? 'ماسٽر ڪي نانس:' : 'Master Key Nonce:'}
                                </p>
                                <motion.code 
                                  className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block overflow-x-auto font-mono"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.8, duration: 0.3 }}
                                >
                                  {encryptedData?.master_key_nonce || encryptedData?.masterKeyNonce || 'N/A'}
                                </motion.code>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="hidden-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center"
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                            <EyeOff className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className={`text-gray-600 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? 'ڊيٽا لڪيل آهي' : 'Data is hidden'}
                            </p>
                            <p className={`text-gray-400 text-sm mt-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                              {isSindhi ? 'ڪلڪ ڪريو ڏيکاريو' : 'Click Show to reveal'}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
              </Card>
            </motion.div>

        {/* Logout Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
        >
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 px-8 py-3 rounded-xl font-medium transition-colors duration-200 bg-white"
          >
            <Shield className={`w-4 h-4 ${isSindhi ? 'ml-2' : 'mr-2'}`} />
            <span className={isSindhi ? 'auto-sindhi-font' : ''}>
              {isSindhi ? 'خارج ٿيو' : 'Sign Out'}
            </span>
          </Button>
        </motion.div>
        </div>
    </div>
  )
} 