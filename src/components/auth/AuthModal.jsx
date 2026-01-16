import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Shield, Atom, Sparkles, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Simple SVG for Google Icon
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <path d="M22.56 12.25C22.56 11.42 22.49 10.62 22.36 9.84H12.27V14.16H18.15C17.86 15.63 17.07 16.89 15.91 17.68V20.25H19.6C21.56 18.44 22.56 15.63 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12.27 23C15.11 23 17.51 22.09 19.13 20.6L15.91 17.97C14.99 18.62 13.76 19.01 12.27 19.01C9.69 19.01 7.54 17.27 6.74 14.88H2.99V17.56C4.7 20.73 8.19 23 12.27 23Z" fill="#34A853"/>
        <path d="M6.74 14.88C6.5 14.18 6.36 13.45 6.36 12.7C6.36 11.95 6.5 11.22 6.74 10.52V7.84H2.99C2.12 9.54 1.64 11.51 1.64 13.5C1.64 15.49 2.12 17.46 2.99 19.16L6.74 16.48V14.88Z" fill="#FBBC05"/>
        <path d="M12.27 6.49C13.88 6.49 15.22 7.03 16.22 7.96L19.21 4.98C17.51 3.36 15.11 2.36 12.27 2.36C8.19 2.36 4.7 4.63 2.99 7.84L6.74 10.52C7.54 8.13 9.69 6.49 12.27 6.49Z" fill="#EA4335"/>
    </svg>
);

// Simple SVG for Apple Icon
const AppleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <path d="M19.39 10.15C19.43 7.63 17.87 6.07 17.75 6.03C16.3-5.28 14.07 5.25 13.38 6.73C12.19 6.13 10.74 6.46 9.87 7.33C8.63 8.57 8.36 10.3 8.8 11.83C9.21 13.22 10.23 14.49 11.45 15.02C12.63 15.54 13.84 15.34 14.77 14.62C14.88 14.54 15.93 13.89 17.22 13.93C18.73 13.98 19.38 14.85 19.42 14.89C19.38 14.93 18.2 15.94 17.15 17.5C15.9 19.34 14.83 21.68 13.29 21.75C11.75 21.82 11.23 20.81 9.82 20.78C8.41 20.75 7.62 21.75 6.24 21.75C4.86 21.75 3.52 19.44 3.52 16.39C3.52 12.35 6.03 9.45 8.18 8.11C9.33 7.42 10.74 6.95 12.22 7.02C12.57 5.56 13.56 4.3 14.81 3.57C14.15 3.1 13.06 2.62 11.91 2.62C9.42 2.62 7.15 4.49 6.13 6.89C6.08 7.01 5.92 7.08 5.78 7.04C4.24 6.52 2.76 7.34 2.19 8.78C2.13 8.92 2.2 9.08 2.32 9.14C3.52 9.78 4.1 11.23 3.96 12.68C3.81 14.28 2.85 15.65 1.7 16.36C1.56 16.44 1.5 16.61 1.57 16.75C2.46 18.78 4.22 22.25 6.46 22.25C7.84 22.25 8.52 21.28 9.93 21.28C11.34 21.28 11.89 22.25 13.36 22.25C14.93 22.25 16.19 19.8 17.47 17.89C18.52 16.29 19.82 15.01 19.86 14.96C19.95 14.84 19.88 14.67 19.74 14.62C18.66 14.23 18.25 13.45 18.29 12.6C18.33 11.63 19.34 11.02 19.39 10.98C19.52 10.89 19.56 10.7 19.5 10.55C19.46 10.43 19.42 10.29 19.39 10.15Z"/>
    </svg>
);


export default function AuthModal({ isOpen, onClose, initialMode = "signup", onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    // Track login/signup attempt
    base44.analytics.track({
      eventName: mode === 'signup' ? 'signup_attempt' : 'login_attempt',
      properties: { provider: 'google' }
    });
    
    try {
      // Use OAuth login with Google
      await base44.auth.loginWithOAuth('google');
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const featureList = [
    { icon: Shield, text: 'Chemical safety analysis', color: 'text-emerald-600' },
    { icon: Atom, text: 'AI-powered formula generation', color: 'text-teal-600' },
    { icon: Sparkles, text: 'Sustainability scoring', color: 'text-violet-600' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/50"
          >
            <div className="relative p-6 sm:p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain Logo" className="h-14 w-auto mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-slate-900">
                  {mode === 'signup' ? 'Join Suttain' : 'Welcome Back'}
                </h2>
                <p className="mt-2 text-slate-600">
                  {mode === 'signup' ? 'Start creating safer, sustainable formulas today' : 'Log in to access your projects'}
                </p>
              </div>

              {mode === 'signup' && (
                <div className="mt-6 space-y-3">
                  {featureList.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      <span className="font-medium text-slate-700">{feature.text}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                      <span className="text-sm font-semibold text-emerald-600 bg-emerald-100/70 border border-emerald-200/80 rounded-full px-4 py-2">
                        Free Trial - No Credit Card Required
                      </span>
                  </div>
                </div>
              )}

              <div className={`mt-8 ${mode === 'login' ? 'pt-4' : ''}`}>
                 {error && (
                    <p className="text-center text-sm text-red-600 mb-4 bg-red-50 p-2 rounded-lg">{error}</p>
                 )}
                <div className="space-y-3">
                    <Button 
                        onClick={handleLogin} 
                        className="w-full text-base font-semibold justify-center h-12 bg-[#02988C] hover:bg-[#028a7f]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <GoogleIcon />
                                Continue with Google
                            </>
                        )}
                    </Button>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-slate-500">
                <p>
                  By continuing, you agree to our{' '}
                  <Link to={createPageUrl("TermsOfService")} onClick={onClose} className="underline hover:text-slate-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to={createPageUrl("PrivacyPolicy")} onClick={onClose} className="underline hover:text-slate-700">
                    Privacy Policy
                  </Link>.
                </p>
                <p className="mt-1">Your formulas and data remain private and secure.</p>
              </div>

               <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-600">
                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button 
                      onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} 
                      className="font-semibold text-[var(--suttain-teal)] hover:text-[#028a7f]"
                    >
                      {mode === 'signup' ? 'Log In' : 'Sign Up'}
                    </button>
                  </p>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}