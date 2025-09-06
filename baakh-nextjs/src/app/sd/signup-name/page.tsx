"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new'

export default function SignupNamePageSD() {
  const [sindhiName, setSindhiName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useE2EEAuth()
  
  // Get the user ID from URL params or auth context
  const userId = searchParams.get('userId') || user?.userId
  
  const handleNext = async () => {
    if (!sindhiName.trim()) {
      setError('سندي نالو داخل ڪريو')
      return
    }
    
    if (sindhiName.trim().length < 2) {
      setError('سندي نالو گهٽ ۾ گهٽ 2 حرف هجڻ گهرجي')
      return
    }
    
    if (!userId) {
      setError('صارف ID نه مليو آهي')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Sending request with userId:', userId, 'sindhiName:', sindhiName.trim())
      
      // Save Sindhi name to both tables
      const response = await fetch('/api/auth/save-sindhi-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sindhiName: sindhiName.trim(),
          language: 'sd'
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Success response:', result)
      
      // Redirect to Sindhi dashboard
      router.push('/sd/dashboard')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`خطا: ${errorMessage}`)
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
          <CardTitle className="text-2xl font-bold auto-sindhi-font">
            سندي نالو شامل ڪريو
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2 auto-sindhi-font">
            پنهنجو سندي نالو داخل ڪريو جيڪو توهان جي شاعري ۾ استعمال ٿيندو
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="sindhiName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 auto-sindhi-font"
            >
              سندي نالو
            </label>
            <Input
              id="sindhiName"
              type="text"
              value={sindhiName}
              onChange={(e) => setSindhiName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="مثال: شاھ عبداللطيف"
              className="text-lg h-12 text-center auto-sindhi-font"
              dir="rtl"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center auto-sindhi-font">
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="auto-sindhi-font">محفوظ ٿي رهيو آهي...</span>
              </div>
            ) : (
              <span className="auto-sindhi-font">اڳتي</span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
