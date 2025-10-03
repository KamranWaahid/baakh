"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  User, 
  Save, 
  LogOut,
  Trash2
} from 'lucide-react'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { user, isAuthenticated, logout, isLoading: authLoading } = useE2EEAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const isSindhi = locale === 'sd'

  // Settings data state
  const [settingsData, setSettingsData] = useState({
    profile: {
      englishName: user?.profile?.name || '',
      sindhiName: (user?.profile as { sindhi_name?: string })?.sindhi_name || '',
      username: user?.username || '',
      bio: 'Sindhi Poetry Enthusiast'
    },
    preferences: {
      notifications: true
    }
  })

  useEffect(() => {
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return
    }

    setIsDeleting(true)
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('e2ee_token')
      
      console.log('Delete account - Token from localStorage:', token ? 'Token present' : 'No token')
      console.log('Delete account - Token preview:', token ? token.substring(0, 20) + '...' : 'No token')
      
      if (!token) {
        console.error('No JWT token found')
        alert(isSindhi ? 'توکن مليو نه آهي' : 'No authentication token found')
        return
      }

      // Call delete account API
      const response = await fetch('/api/auth/delete-account/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('Account deleted successfully')
          // Clear user data and redirect
          logout()
          router.push(isSindhi ? '/sd' : '/')
        } else {
          console.error('API error:', result.message)
          alert(isSindhi ? `خرابي: ${result.message}` : `Error: ${result.message}`)
        }
      } else {
        const errorData = await response.json()
        console.error('HTTP error:', response.status, errorData)
        alert(isSindhi ? `خرابي: ${errorData.message || 'سرور خرابي'}` : `Error: ${errorData.message || 'Server error'}`)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert(isSindhi ? 'ڪائونٽ ڊيليٽ ڪرڻ ۾ خرابي' : 'Error deleting account')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const updateSettingsData = (section: string, field: string, value: string | boolean | number) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
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


  const tabs = [
    {
      id: 'profile',
      label: isSindhi ? 'پروفائل' : 'Profile',
      icon: User
    },
    {
      id: 'preferences',
      label: isSindhi ? 'ترجيحون' : 'Preferences',
      icon: Settings
    }
  ]

  return (
    <div className={`min-h-screen bg-white ${isSindhi ? 'dir-rtl' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1 className={`text-3xl font-bold text-gray-900 mb-3 tracking-tight ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {isSindhi ? 'سيٽنگون' : 'Settings'}
          </h1>
          <p className={`text-gray-500 text-base font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {isSindhi ? 'پنهنجي ترجيحون منظم ڪريو' : 'Manage your preferences'}
          </p>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSindhi ? 'ml-2' : 'mr-2'}`} />
                  <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                    {tab.label}
                  </span>
                </Button>
              )
            })}
          </div>
        </motion.div>

        {/* Settings Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-lg font-semibold text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'پروفائل جي معلومات' : 'Profile Information'}
                      </h2>
                      <p className={`text-sm text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'پنهنجي ذاتي معلومات اپڊيٽ ڪريو' : 'Update your personal information'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className={`text-sm font-medium text-gray-700 mb-2 block ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'انگريزي نالو' : 'English Name'}
                        </Label>
                        <Input
                          value={settingsData.profile.englishName}
                          onChange={(e) => updateSettingsData('profile', 'englishName', e.target.value)}
                          className="border border-gray-200 rounded-lg focus:border-gray-300 focus:ring-0"
                          placeholder={isSindhi ? 'انگريزي نالو' : 'English Name'}
                        />
                      </div>
                      <div>
                        <Label className={`text-sm font-medium text-gray-700 mb-2 block ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'سنڌي نالو' : 'Sindhi Name'}
                        </Label>
                        <Input
                          value={settingsData.profile.sindhiName}
                          onChange={(e) => updateSettingsData('profile', 'sindhiName', e.target.value)}
                          className="border border-gray-200 rounded-lg focus:border-gray-300 focus:ring-0 auto-sindhi-font"
                          placeholder={isSindhi ? 'سنڌي نالو' : 'Sindhi Name'}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className={`text-sm font-medium text-gray-700 mb-2 block ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'صارف نالو' : 'Username'}
                      </Label>
                      <Input
                        value={settingsData.profile.username}
                        onChange={(e) => updateSettingsData('profile', 'username', e.target.value)}
                        className="border border-gray-200 rounded-lg focus:border-gray-300 focus:ring-0"
                        placeholder={isSindhi ? 'صارف نالو' : 'Username'}
                      />
                    </div>
                    <div>
                      <Label className={`text-sm font-medium text-gray-700 mb-2 block ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'بائيو' : 'Bio'}
                      </Label>
                      <Input
                        value={settingsData.profile.bio}
                        onChange={(e) => updateSettingsData('profile', 'bio', e.target.value)}
                        className="border border-gray-200 rounded-lg focus:border-gray-300 focus:ring-0"
                        placeholder={isSindhi ? 'پنهنجي باري ۾ لکيو' : 'Tell us about yourself'}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          {isSindhi ? 'محفوظ ٿي رهيو آهي...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isSindhi ? 'تبديل محفوظ ڪريو' : 'Save Changes'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                      <Settings className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-lg font-semibold text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'ترجيحون' : 'Preferences'}
                      </h2>
                      <p className={`text-sm text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                        {isSindhi ? 'پنهنجي ترجيحون ترتيب ڏيو' : 'Configure your preferences'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className={`text-sm font-medium text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'نوٽيفڪيشن' : 'Notifications'}
                        </h3>
                        <p className={`text-xs text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'نئين مواد جي باري ۾ اطلاع حاصل ڪريو' : 'Get notified about new content'}
                        </p>
                      </div>
                      <Switch
                        checked={settingsData.preferences.notifications}
                        onCheckedChange={(checked) => updateSettingsData('preferences', 'notifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          {isSindhi ? 'محفوظ ٿي رهيو آهي...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isSindhi ? 'تبديل محفوظ ڪريو' : 'Save Changes'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            
            <Button 
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 px-8 py-3 rounded-xl font-medium transition-colors duration-200 bg-white"
            >
              <Trash2 className={`w-4 h-4 ${isSindhi ? 'ml-2' : 'mr-2'}`} />
              <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                {isSindhi ? 'ڪائونٽ ڊيليٽ ڪريو' : 'Delete Account'}
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Delete Confirmation Popup */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-200">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'ڪائونٽ ڊيليٽ ڪريو' : 'Delete Account'}
                  </h3>
                  <p className={`text-sm text-gray-500 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi 
                      ? 'هي عمل واپس نه آيو. پنهنجو ڪائونٽ ڊيليٽ ڪرڻ لاءِ "DELETE" لکو.'
                      : 'This action cannot be undone. Type "DELETE" to confirm account deletion.'
                    }
                  </p>
                </div>

                <div className="mb-6">
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={isSindhi ? 'DELETE لکو' : 'Type DELETE'}
                    className="border border-gray-200 rounded-lg focus:border-red-300 focus:ring-red-200 text-center font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    {isSindhi ? 'منسوخ' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        {isSindhi ? 'ڊيليٽ ٿي رهيو آهي...' : 'Deleting...'}
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isSindhi ? 'ڊيليٽ ڪريو' : 'Delete'}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
