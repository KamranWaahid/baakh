"use client"

import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useE2EEAuth } from "@/hooks/useE2EEAuth-new"

interface LoginFormProps extends React.ComponentProps<"div"> {
  isSindhi?: boolean;
}

export function LoginForm({
  className,
  isSindhi = false,
  ...props
}: LoginFormProps) {
  const [isSignup, setIsSignup] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordValidation, setPasswordValidation] = React.useState({
    hasCapital: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false
  });
  const { signup, login } = useE2EEAuth();

  // Password validation function
  const validatePassword = (password: string) => {
    const hasCapital = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;

    setPasswordValidation({
      hasCapital,
      hasLowercase,
      hasNumber,
      hasSpecial,
      hasMinLength
    });

    return hasCapital && hasLowercase && hasNumber && hasSpecial && hasMinLength;
  };

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      
      // For now, we'll use a simple redirect to Google OAuth
      // In a real implementation, you would use a proper OAuth library
      const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&response_type=code&scope=email profile&access_type=offline`;
      
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google sign-in error:', error);
      setErrorMsg(isSindhi ? 'گوگل سان داخل ٿيڻ ۾ مسئلو آيو' : 'Error signing in with Google');
    } finally {
      setSubmitting(false);
    }
  };

  const content = {
    title: isSindhi ? 'باک ۾ ڀليڪار' : 'Welcome to Baakh',
    subtitleLogin: isSindhi ? 'اڳ ۾ کاتو ناھي ٺھيل آهي؟ تہ پوءِ' : "Don't have an account?",
    subtitleSignup: isSindhi ? 'اڳ ۾ کاتو ٺھيل آھي؟ تہ پوءِ' : 'Already have an account?',
    email: isSindhi ? 'اي ميل' : 'Email',
    emailPlaceholder: isSindhi ? 'baakh@example.com' : 'baakh@example.com',
    name: isSindhi ? 'نالو لکو' : 'Name',
    password: isSindhi ? 'پاسورڊ ھڻو' : 'Password',
    confirmPassword: isSindhi ? 'پاسورڊ ٻيھر ھڻو' : 'Confirm password',
    login: isSindhi ? 'داخل ٿيو' : 'Login',
    signup: isSindhi ? 'کاتو ٺاھيو' : 'Sign up',
    or: isSindhi ? 'يا' : 'Or',
    continueWithApple: isSindhi ? 'ايپل سان جاري رکو' : 'Continue with Apple',
    continueWithGoogle: isSindhi ? 'گوگل سان جاري رکو' : 'Continue with Google',
    terms: isSindhi 
      ? 'کاتو ٺاھڻ يا داخل ٿيڻ جو مطلب آھي تہ توهان اسانجي شرطون ۽ رازداري پاليسي سان متفق آهيو.'
      : 'By clicking continue, you agree to our Terms of Service and Privacy Policy.',
    termsLink: isSindhi ? 'سروس جون شرطون' : 'Terms of Service',
    privacyLink: isSindhi ? 'رازداري پاليسي' : 'Privacy Policy',
    linkLogin: isSindhi ? 'داخل ٿيو' : 'Log in',
    linkSignup: isSindhi ? 'کاتو ٺاھيو' : 'Sign up',
  };

  return (
    <div className={cn("flex flex-col gap-6 overflow-hidden", isSindhi && "auto-sindhi-font", className)} dir={isSindhi ? 'rtl' : 'ltr'} {...props}>
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const formData = new FormData(form);
          const payload: any = {
            email: (formData.get('email') as string) || '',
          };
          if (isSignup) {
            payload.name = (formData.get('name') as string) || '';
            payload.password = (formData.get('password') as string) || '';
            const confirm = (formData.get('confirmPassword') as string) || '';
            if (!payload.name || !payload.email || !payload.password || !confirm) {
              setErrorMsg(isSindhi ? 'مھرباني ڪري سڀ فيلڊ ڀريو' : 'Please fill all fields');
              return;
            }
            
            // Validate password strength
            if (!validatePassword(payload.password)) {
              setErrorMsg(isSindhi ? 'پاسورڊ ۾ گهٽ ۾ گهٽ 8 حرف، هڪ وڏو اکر، هڪ ننڍو اکر، هڪ نمبر ۽ هڪ خاص حرف هجڻ گهرجي' : 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
              return;
            }
            
            if (payload.password !== confirm) {
              setErrorMsg(isSindhi ? 'پاسورڊ نٿا مليا' : 'Passwords do not match');
              return;
            }
          } else {
            payload.password = (formData.get('password') as string) || '';
            if (!payload.email || !payload.password) {
              setErrorMsg(isSindhi ? 'مھرباني ڪري اي ميل ۽ پاسورڊ ڀريو' : 'Please enter email and password');
              return;
            }
          }
          try {
            setSubmitting(true);
            setErrorMsg(null);
            
            if (isSignup) {
              // Use username as identifier for E2EE system
              const username = payload.email.split('@')[0]; // Extract username from email
              console.log('Signing up with username:', username);
              const result = await signup(username, payload.password, {
                email: payload.email,
                name: payload.name
              });
              
              // Check if user needs to add Sindhi name
              if (result.needsSindhiName) {
                setErrorMsg(null);
                setSubmitting(false);
                
                const successMsg = isSindhi ? 'کامیاب! سندي نالو شامل ڪرڻ لاءِ رجوع ڪري رهيو آهي...' : '✅ Success! Redirecting to add Sindhi name...';
                setErrorMsg(successMsg);
                
                            // Clear form data
            setPassword('');
            setConfirmPassword('');
            setPasswordValidation({
              hasCapital: false,
              hasLowercase: false,
              hasNumber: false,
              hasSpecial: false,
              hasMinLength: false
            });
            
            // Redirect to signup-name page
            setTimeout(() => {
              try {
                const redirectUrl = isSindhi 
                  ? `/sd/signup-name?userId=${result.userId}`
                  : `/signup-name?userId=${result.userId}`;
                window.location.href = redirectUrl;
              } catch (redirectError) {
                console.error('Redirect error:', redirectError);
                // Fallback redirect
                window.location.href = isSindhi ? '/sd' : '/en';
              }
            }, 1500);
                return;
              }
            } else {
              // For login, try both email and username extraction
              let username = payload.email;
              
              // If it looks like an email, extract username part
              if (payload.email.includes('@')) {
                username = payload.email.split('@')[0];
              }
              
              console.log('Logging in with username:', username);
              await login(username, payload.password);
            }
            
            // On success, show success message and redirect
            setErrorMsg(null);
            setSubmitting(false);
            
            // Clear form data
            setPassword('');
            setConfirmPassword('');
            setPasswordValidation({
              hasCapital: false,
              hasLowercase: false,
              hasNumber: false,
              hasSpecial: false,
              hasMinLength: false
            });
            
            // Show success message briefly before redirect
            const successMsg = isSindhi ? 'کامیاب! رجوع ڪري رهيو آهي...' : 'Success! Redirecting...';
            setErrorMsg(successMsg);
            
            // Redirect immediately to home page
            try {
              window.location.href = isSindhi ? '/sd' : '/en';
            } catch (redirectError) {
              console.error('Redirect error:', redirectError);
              // Fallback - try to navigate using Next.js router if available
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }
          } catch (err: any) {
            console.error('Auth error', err);
            
            // Provide more specific error messages
            let errorMessage = err.message || 'Something went wrong';
            
            if (errorMessage.includes('Invalid credentials')) {
              errorMessage = isSindhi ? 'غلط صارف نالو يا پاسورڊ' : 'Invalid username or password';
            } else if (errorMessage.includes('Login failed')) {
              errorMessage = isSindhi ? 'لاگ ان ناڪام ٿي ويو' : 'Login failed';
            } else if (errorMessage.includes('Signup failed')) {
              errorMessage = isSindhi ? 'سائن اپ ناڪام ٿي ويو' : 'Signup failed';
            }
            
            setErrorMsg(errorMessage);
            setSubmitting(false);
          }
        }}
      >
        <div className="space-y-1 text-center">
          <h1 className={`text-lg font-semibold tracking-tight leading-tight text-gray-900 ${isSindhi ? 'auto-sindhi-font' : ''}`} dir={isSindhi ? 'rtl' : 'ltr'}>
            {content.title}
          </h1>
          <div className={`text-xs text-gray-500 leading-snug ${isSindhi ? 'auto-sindhi-font' : ''}`} dir={isSindhi ? 'rtl' : 'ltr'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isSignup ? 'subtitle-signup' : 'subtitle-login'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {isSignup ? content.subtitleSignup : content.subtitleLogin}
              </motion.span>
            </AnimatePresence>{' '}
            <a
              href="#"
              onClick={(e) => { 
                e.preventDefault(); 
                setIsSignup((v) => !v); 
                // Reset password fields when switching modes
                setPassword('');
                setConfirmPassword('');
                setPasswordValidation({
                  hasCapital: false,
                  hasLowercase: false,
                  hasNumber: false,
                  hasSpecial: false,
                  hasMinLength: false
                });
              }}
              className="underline underline-offset-4 hover:text-gray-700"
            >
              {isSignup ? content.linkLogin : content.linkSignup}
            </a>
          </div>
        </div>
        <motion.div className="space-y-3.5 pb-6" layout>
          <div className="grid gap-3">
            <AnimatePresence initial={false}>
              {isSignup && (
                <motion.div
                  key="name-field"
                  className="grid gap-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Label htmlFor="name" className={`text-xs text-gray-700 leading-none ${isSindhi ? 'auto-sindhi-font' : ''}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                    {content.name}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    dir={isSindhi ? 'rtl' : 'ltr'}
                    className={`h-9 text-sm rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-0 placeholder:text-gray-400 ${isSindhi ? 'text-right' : 'text-left'}`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grid gap-2">
              <Label htmlFor="email" className={`text-xs text-gray-700 leading-none ${isSindhi ? 'auto-sindhi-font' : ''}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                {isSignup ? content.email : (isSindhi ? 'اي ميل يا صارف نالو' : 'Email or Username')}
              </Label>
                          <Input
              id="email"
              name="email"
              type={isSignup ? "email" : "text"}
              placeholder={isSignup ? content.emailPlaceholder : (isSindhi ? 'waahidkamran@gmail.com يا waahidkamran' : 'waahidkamran@gmail.com or waahidkamran')}
              autoComplete="email"
              required
              dir={isSindhi ? 'rtl' : 'ltr'}
              className={`h-9 text-sm rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-0 placeholder:text-gray-400 ${isSindhi ? 'text-right' : 'text-left'}`}
            />
            {!isSignup && (
              <div className={`text-xs text-gray-500 ${isSindhi ? 'auto-sindhi-font text-right' : 'text-left'}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                {isSindhi ? 'اي ميل يا صارف نالو استعمال ڪريو' : 'Use your email or username'}
              </div>
            )}
            </div>
            <AnimatePresence initial={false}>
              {isSignup && (
                <motion.div
                  key="password-fields"
                  className="grid gap-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="password" className={`text-xs text-gray-700 leading-none ${isSindhi ? 'auto-sindhi-font' : ''}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                      {content.password}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      autoComplete="new-password"
                      required
                      dir={isSindhi ? 'rtl' : 'ltr'}
                      className={`h-9 text-sm rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-0 placeholder:text-gray-400 ${isSindhi ? 'text-right' : 'text-left'}`}
                    />
                    <div className={`text-xs text-gray-500 ${isSindhi ? 'auto-sindhi-font text-right' : 'text-left'}`}>
                      {isSindhi ? 'پاسورڊ ۾ گهٽ ۾ گهٽ 8 حرف، هڪ وڏو اکر، هڪ ننڍو اکر، هڪ نمبر ۽ هڪ خاص حرف هجڻ گهرجي' : 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'}
                    </div>
                    
                    {/* Password strength bar */}
                    {isSignup && password && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            Object.values(passwordValidation).filter(Boolean).length === 5 
                              ? 'bg-green-500' 
                              : Object.values(passwordValidation).filter(Boolean).length >= 3 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%` 
                          }}
                        ></div>
                      </div>
                    )}
                    
                    {/* Password strength text */}
                    {isSignup && password && (
                      <div className="text-xs">
                        <span className={`font-medium ${
                          Object.values(passwordValidation).filter(Boolean).length === 5 
                            ? 'text-green-600' 
                            : Object.values(passwordValidation).filter(Boolean).length >= 3 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {Object.values(passwordValidation).filter(Boolean).length === 5 
                            ? (isSindhi ? '✅ پاسورڊ مضبوط آهي' : '✅ Strong password')
                            : Object.values(passwordValidation).filter(Boolean).length >= 3 
                              ? (isSindhi ? '⚠️ پاسورڊ درمياني آهي' : '⚠️ Medium password')
                              : (isSindhi ? '❌ پاسورڊ ڪمزور آهي' : '❌ Weak password')
                          }
                        </span>
                      </div>
                    )}
                    
                    {/* Password validation indicators */}
                    {isSignup && password && (
                      <div className="space-y-2 text-xs">
                        <div className={`flex items-center gap-2 ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordValidation.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          {isSindhi ? 'گهٽ ۾ گهٽ 8 حرف' : 'At least 8 characters'}
                        </div>
                        <div className={`flex items-center gap-2 ${passwordValidation.hasCapital ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordValidation.hasCapital ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          {isSindhi ? 'هڪ وڏو اکر (A-Z)' : 'One uppercase letter (A-Z)'}
                        </div>
                        <div className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          {isSindhi ? 'هڪ ننڍو اکر (a-z)' : 'One lowercase letter (a-z)'}
                        </div>
                        <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          {isSindhi ? 'هڪ نمبر (0-9)' : 'One number (0-9)'}
                        </div>
                        <div className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecial ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          {isSindhi ? 'هڪ خاص حرف (!@#$%^&*)' : 'One special character (!@#$%^&*)'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className={`text-xs text-gray-700 leading-none ${isSindhi ? 'auto-sindhi-font' : ''}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                      {content.confirmPassword}
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      dir={isSindhi ? 'rtl' : 'ltr'}
                      className={`h-9 text-sm rounded-lg border border-gray-300 focus:ring-0 placeholder:text-gray-400 ${isSindhi ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!isSignup && (
              <div className="grid gap-2">
                <Label htmlFor="password" className={`text-xs text-gray-700 leading-none ${isSindhi ? 'auto-sindhi-font' : ''}`} dir={isSindhi ? 'rtl' : 'ltr'}>
                  {content.password}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  dir={isSindhi ? 'rtl' : 'ltr'}
                  className={`h-9 text-sm rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-0 placeholder:text-gray-400 ${isSindhi ? 'text-right' : 'text-left'}`}
                />
              </div>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              type="submit" 
              disabled={submitting} 
              className="w-full h-9 rounded-full border border-gray-200 bg-black text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {submitting ? (
                  <motion.div
                    key="loading"
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {isSindhi ? 'جي رهيو آهي...' : 'Processing...'}
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.span
                    key={isSignup ? 'cta-signup' : 'cta-login'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ 
                      duration: 0.2,
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20 
                    }}
                  >
                    {isSignup ? content.signup : content.login}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Loading background animation */}
              {submitting && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </Button>
          </motion.div>
          {errorMsg && (
            <div className={`text-center text-xs ${isSindhi ? 'auto-sindhi-font' : ''} ${errorMsg.includes('✅') ? 'text-green-600' : 'text-red-600'}`} dir={isSindhi ? 'rtl' : 'ltr'}>
              {errorMsg}
            </div>
          )}
        </motion.div>

        <div className="after:border-gray-200 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-white text-gray-500 relative z-10 px-2">
            {content.or}
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center px-3 py-2"
            onClick={handleGoogleSignIn}
          >
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {/* Google icon (monochrome) */}
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                className="mr-2 h-4 w-4 flex-shrink-0" 
                fill="currentColor" 
                aria-hidden="true"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M12 10.2v3.6h5.06c-.22 1.26-1.65 3.6-5.06 3.6-3.18 0-5.76-2.58-5.76-5.76S8.82 6 12 6c1.86 0 3.02.78 3.68 1.5l2.46-2.4C16.82 3.9 14.6 3 12 3 6.9 3 2.7 7.2 2.7 12.3S6.9 21.6 12 21.6c5.7 0 9.3-4 9.3-9.6 0-.54-.06-1.02-.18-1.5H12z"/>
              </motion.svg>
              <motion.span 
                className="text-sm truncate"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {content.continueWithGoogle}
              </motion.span>
            </motion.div>
          </Button>
        </motion.div>

        <div className="text-gray-400 text-center leading-tight text-balance" dir={isSindhi ? 'rtl' : 'ltr'}>
          {isSindhi ? (
            <>
              <div className="auto-sindhi-font text-[8px]">کاتو ٺاھڻ يا داخل ٿيڻ جو مطلب آھي تہ توهان</div>
              <div className="auto-sindhi-font text-[8px]">اسانجي <a href="#" className="text-gray-500 hover:text-gray-600 underline underline-offset-1">سروس جون شرطون</a> ۽ <a href="#" className="text-gray-500 hover:text-gray-600 underline underline-offset-1">رازداري پاليسي</a> سان متفق آهيو.</div>
            </>
          ) : (
            <>
              <span className="text-xs">{content.terms}{' '}</span>
              <a href="#" className="text-gray-500 hover:text-gray-600 underline underline-offset-1 text-xs">{content.termsLink}</a>{' '}
              <span className="text-xs">and{' '}</span>
              <a href="#" className="text-gray-500 hover:text-gray-600 underline underline-offset-1 text-xs">{content.privacyLink}</a>.
            </>
          )}
        </div>
      </form>
    </div>
  )
}
