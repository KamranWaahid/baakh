"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new'

export default function SignupNamePage() {
  const [sindhiName, setSindhiName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useE2EEAuth()
  
  // Get the user ID from URL params or auth context
  const userId = searchParams.get('userId') || user?.userId
  
  // Default to English (LTR) for this page
  const isRTL = false
  
  const handleNext = async () => {
    if (!sindhiName.trim()) {
      setError(isRTL ? 'سندي نالو داخل ڪريو' : 'Please enter your Sindhi name')
      return
    }
    
    if (sindhiName.trim().length < 2) {
      setError(isRTL ? 'سندي نالو گهٽ ۾ گهٽ 2 حرف هجڻ گهرجي' : 'Sindhi name must be at least 2 characters')
      return
    }
    
    if (!userId) {
      setError(isRTL ? 'صارف ID نه مليو آهي' : 'User ID not found')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // Save Sindhi name to both tables
      const response = await fetch('/api/auth/save-sindhi-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sindhiName: sindhiName.trim(),
          language: 'en'
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Success response:', result)
      
      // Redirect to next step or dashboard
      router.push(isRTL ? '/sd/dashboard' : '/en/dashboard')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(isRTL ? `خطا: ${errorMessage}` : `Error: ${errorMessage}`)
      console.error('Error saving Sindhi name:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext()
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl font-bold ${isRTL ? 'auto-sindhi-font' : ''}`}>
            {isRTL ? 'سندي نالو شامل ڪريو' : 'Add Your Sindhi Name'}
          </CardTitle>
          <p className={`text-gray-600 dark:text-gray-400 mt-2 ${isRTL ? 'auto-sindhi-font' : ''}`}>
            {isRTL 
              ? 'پنهنجو سندي نالو داخل ڪريو جيڪو توهان جي شاعري ۾ استعمال ٿيندو'
              : 'Enter your Sindhi name that will be used in your poetry'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="sindhiName" 
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'auto-sindhi-font' : ''}`}
            >
              {isRTL ? 'سندي نالو' : 'Sindhi Name'}
            </label>
            <Input
              id="sindhiName"
              type="text"
              value={sindhiName}
              onChange={(e) => setSindhiName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRTL ? 'مثال: شاھ عبداللطيف' : 'Example: Shah Abdul Latif'}
              className={`text-lg h-12 text-center ${isRTL ? 'auto-sindhi-font' : ''}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isLoading || !sindhiName.trim()}
            className="w-full h-12 text-lg font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isRTL ? 'محفوظ ٿي رهيو آهي...' : 'Saving...'}
              </div>
            ) : (
              <span className={isRTL ? 'auto-sindhi-font' : ''}>
                {isRTL ? 'اڳتي' : 'Next'}
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
