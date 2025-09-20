"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useE2EEAuth } from '@/hooks/useE2EEAuth';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'like' | 'bookmark' | 'general';
}

export function AuthModal({ isOpen, onClose, context = 'general' }: AuthModalProps) {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signup, login } = useE2EEAuth();

  // Content based on language and context
  const getSubtitle = () => {
    if (context === 'like' || context === 'bookmark') {
      return isSindhi 
        ? 'لائيڪ يا شاعري بوڪ مارڪ ڪرڻ لاءِ اوھان کي ويبسائيٽ ۾ داخل ٿيڻو پوندو.'
        : 'You need to sign in to like or bookmark poetry.';
    }
    return isSindhi ? 'پنھنجي اڪائونٽ ۾ داخل ٿيو' : 'Sign in to your account';
  };

  const content = {
    title: isSindhi ? 'داخل ٿيو' : 'Sign In',
    subtitle: getSubtitle(),
    createAccount: isSindhi ? 'نيو اڪائونٽ ٺاهيو' : 'Create Account',
    createAccountSubtitle: isSindhi ? 'نيو اڪائونٽ ٺاهيو ۽ شروع ڪريو' : 'Create a new account to get started',
    username: isSindhi ? 'صارف نالو' : 'Username',
    email: isSindhi ? 'اي ميل' : 'Email',
    fullName: isSindhi ? 'مڪمل نالو' : 'Full Name',
    password: isSindhi ? 'پاسورڊ' : 'Password',
    signIn: isSindhi ? 'داخل ٿيو' : 'Sign In',
    signUp: isSindhi ? 'رجسٽر ٿيو' : 'Sign Up',
    processing: isSindhi ? 'ڪم ٿي رهيو آهي...' : 'Processing...',
    alreadyHaveAccount: isSindhi ? 'پهريان کان اڪائونٽ آهي؟ داخل ٿيو' : 'Already have an account? Sign In',
    needAccount: isSindhi ? 'اڪائونٽ جي ضرورت آهي؟ رجسٽر ٿيو' : 'Need an account? Sign Up',
    cancel: isSindhi ? 'منسوخ' : 'Cancel',
    orContinueWith: isSindhi ? 'يا ان سان جاري رکو' : 'Or continue with',
    googleSignIn: isSindhi ? 'گوگل سان داخل ٿيو' : 'Continue with Google',
    appleSignIn: isSindhi ? 'ايپل سان داخل ٿيو' : 'Continue with Apple',
    error: isSindhi ? 'غلطي ٿي ويئي' : 'Authentication failed'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignup) {
        await signup(username, password, { email, name });
        onClose();
      } else {
        await login(username, password);
        onClose();
      }
    } catch (error: any) {
      setError(error.message || content.error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setName('');
    setError('');
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign-in
    console.log('Google sign-in clicked');
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple sign-in
    console.log('Apple sign-in clicked');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 15 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <CardHeader className="relative pb-4 pt-6 px-6">
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5 text-gray-500" />
              </motion.button>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <motion.div
                  key={isSignup ? 'signup' : 'signin'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle className={cn(
                    "text-2xl font-semibold text-gray-900 mb-2",
                    isSindhi ? 'auto-sindhi-font' : ''
                  )}>
                    {isSignup ? content.createAccount : content.title}
                  </CardTitle>
                  <p className={cn(
                    "text-sm text-gray-600",
                    isSindhi ? 'auto-sindhi-font' : ''
                  )}>
                    {isSignup ? content.createAccountSubtitle : content.subtitle}
                  </p>
                </motion.div>
              </motion.div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {/* Social Sign-in Buttons */}
              <motion.div 
                className="space-y-3 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full h-12 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-medium transition-all duration-200"
                  >
                    <motion.svg 
                      className="w-5 h-5 mr-3" 
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </motion.svg>
                    {content.googleSignIn}
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAppleSignIn}
                    className="w-full h-12 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-medium transition-all duration-200"
                  >
                    <motion.svg 
                      className="w-5 h-5 mr-3" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.78 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </motion.svg>
                    {content.appleSignIn}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Divider */}
              <motion.div 
                className="relative mb-4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <motion.div 
                    className="w-full border-t border-gray-200"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                </div>
                <motion.div 
                  className="relative flex justify-center text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <span className={cn(
                    "px-4 bg-white text-gray-500",
                    isSindhi ? 'auto-sindhi-font' : ''
                  )}>
                    {content.orContinueWith}
                  </span>
                </motion.div>
              </motion.div>

              {/* Form */}
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div 
                  className="space-y-4"
                  layout
                >
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <motion.div
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      whileHover={{ scale: 1.1, color: "#6b7280" }}
                      transition={{ duration: 0.2 }}
                    >
                      <User className="h-5 w-5" />
                    </motion.div>
                    <Input
                      placeholder={content.username}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-0 transition-all duration-200"
                      required
                    />
                  </motion.div>
                  
                  <AnimatePresence>
                    {isSignup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <motion.div 
                          className="relative"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <motion.div
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                            whileHover={{ scale: 1.1, color: "#6b7280" }}
                            transition={{ duration: 0.2 }}
                          >
                            <Mail className="h-5 w-5" />
                          </motion.div>
                          <Input
                            type="email"
                            placeholder={content.email}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-0 transition-all duration-200"
                            required
                          />
                        </motion.div>
                        <motion.div 
                          className="relative"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <motion.div
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                            whileHover={{ scale: 1.1, color: "#6b7280" }}
                            transition={{ duration: 0.2 }}
                          >
                            <User className="h-5 w-5" />
                          </motion.div>
                          <Input
                            placeholder={content.fullName}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-12 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-0 transition-all duration-200"
                            required
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: isSignup ? 0.3 : 0.6 }}
                  >
                    <motion.div
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      whileHover={{ scale: 1.1, color: "#6b7280" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className="h-5 w-5" />
                    </motion.div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={content.password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-0 transition-all duration-200"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        key={showPassword ? 'eye-off' : 'eye'}
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className={cn(
                      "text-red-600 text-sm text-center",
                      isSindhi ? 'auto-sindhi-font' : ''
                    )}>
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200"
                      disabled={isLoading}
                    >
                      <motion.span
                        key={isLoading ? 'loading' : (isSignup ? 'signup' : 'signin')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isLoading ? content.processing : (isSignup ? content.signUp : content.signIn)}
                      </motion.span>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>

              {/* Toggle Mode */}
              <motion.div 
                className="mt-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <motion.button
                  type="button"
                  onClick={toggleMode}
                  className={cn(
                    "text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors",
                    isSindhi ? 'auto-sindhi-font' : ''
                  )}
                  whileHover={{ scale: 1.05, color: "#1f2937" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    key={isSignup ? 'already-have' : 'need-account'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSignup ? content.alreadyHaveAccount : content.needAccount}
                  </motion.span>
                </motion.button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
