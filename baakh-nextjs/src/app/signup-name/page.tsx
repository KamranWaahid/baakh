"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function SignupNameContent() {
  const [sindhiName, setSindhiName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login } = useE2EEAuth()
  
  // Get the user ID from URL params or auth context
  const userId = searchParams.get('userId') || user?.userId
  
  const handleSubmit = async () => {
    if (!sindhiName.trim()) {
      setError('Please enter your Sindhi name')
      return
    }
    
    if (sindhiName.trim().length < 2) {
      setError('Sindhi name must be at least 2 characters')
      return
    }
    
    if (!userId) {
      setError('User ID not found')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/save-sindhi-name/', {
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
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // If we got a token, log in the user automatically
      if (result.token) {
        console.log('Auto-login after Sindhi name save')
        // Store the token in localStorage
        localStorage.setItem('e2ee_token', result.token)
        
        // Redirect to dashboard (the auth system will pick up the token)
        router.push('/en/dashboard')
      } else {
        // Fallback: redirect to login
        router.push('/en/login')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }
  
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onError={(error) => {
            console.error('Motion div error:', error);
          }}
        >
          <motion.input
            type="text"
            value={sindhiName}
            onChange={(e) => setSindhiName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="سنڌي نالو لکو"
            className="w-full h-16 px-6 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:border-gray-300 focus:outline-none text-center auto-sindhi-font placeholder:text-gray-400 placeholder:auto-sindhi-font"
            style={{ fontFamily: 'inherit' }}
            dir="rtl"
            autoFocus
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileFocus={{ scale: 1.02 }}
          />
          
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit().catch((error) => {
                console.error('Button click error:', error);
                setError('An error occurred. Please try again.');
              });
            }}
            disabled={isLoading || !sindhiName.trim()}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div
                  key="arrow"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              className="text-red-500 text-sm text-center mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function SignupNamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-base text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <SignupNameContent />
    </Suspense>
  )
}
