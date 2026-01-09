import React, { useContext } from 'react';
import AuthContext from '../auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Crown, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const PremiumFeatureGate = ({ children, featureName, featureDescription }) => {
  const { user, isAuthLoading, openAuthModal } = useContext(AuthContext);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Loader2 className="w-8 h-8 text-[var(--suttain-teal)] animate-spin" />
      </div>
    );
  }

  // Case 1: User is an Admin - Grant Access
  if (user && user.role === 'admin') {
    return <>{children}</>;
  }

  // Case 2: User is logged in but NOT an Admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-3xl w-full mx-auto"
        >
          <Card className="text-center shadow-2xl border-0 overflow-hidden">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{featureName}</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                <Lock className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-sm">Premium Feature</span>
              </div>
            </div>

            <CardContent className="p-8 space-y-6">
              <p className="text-slate-600 text-lg leading-relaxed">
                {featureDescription}
              </p>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-900 text-sm font-medium">
                  This feature is currently available to administrators and premium members only.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  onClick={() => window.location.href = 'mailto:contact@suttain.com?subject=Premium Feature Access Request: ' + featureName}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-6 text-base shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Request Premium Access
                </Button>
                
                <p className="text-xs text-slate-500">
                  Contact us to learn more about premium features and pricing
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Case 3: User is NOT logged in (Public)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-3xl w-full mx-auto"
      >
        <Card className="text-center shadow-2xl border-0 overflow-hidden">
          {/* Premium Header */}
          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 p-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{featureName}</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Premium Feature</span>
            </div>
          </div>

          <CardContent className="p-8 space-y-6">
            <p className="text-slate-600 text-lg leading-relaxed">
              {featureDescription}
            </p>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-purple-900 text-sm font-medium">
                Sign up to explore this premium feature and unlock advanced capabilities.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => openAuthModal('signup')}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-6 text-base shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Sign Up & Get Started
              </Button>
              
              <Button 
                onClick={() => openAuthModal('login')}
                variant="outline"
                className="w-full py-6 text-base border-2"
              >
                Already have an account? Log in
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PremiumFeatureGate;