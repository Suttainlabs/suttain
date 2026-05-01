import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthContext from './AuthContext';

export default function AuthGate({ children, featureName, featureDescription }) {
  const { user, isAuthLoading, openAuthModal } = useContext(AuthContext);

  const handleAuthAction = (mode) => {
    if (typeof openAuthModal === 'function') {
      openAuthModal(mode);
    } else {
      console.error("AuthGate Error: openAuthModal function not found in context.");
      alert("Could not open authentication form. Please refresh and try again.");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[var(--suttain-teal)] animate-spin" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="text-center shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Unlock the {featureName || 'Full Experience'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                {featureDescription || 'Please sign up or log in to access this feature. Join our community to start creating and simulating!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => handleAuthAction('login')}
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-white"
                >
                  Login
                </Button>
                <Button
                  onClick={() => handleAuthAction('signup')}
                  size="lg"
                  className="flex-1 btn-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sign Up Free
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mx-auto w-fit">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-700">No credit card required</p>
              </div>
              <p className="text-xs text-slate-500">
                Free tier includes simulations, formula generation, and unlimited product scans.
              </p>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}