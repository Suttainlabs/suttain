import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { HeartPulse, Plus, Shield, Activity, TrendingUp, AlertTriangle, UserPlus } from 'lucide-react';
import ProfileSetupModal from './ProfileSetupModal';
import ProfileCard from './ProfileCard';
import AlertsHistory from './AlertsHistory';
import SafetyInsights from './SafetyInsights';
import SafetyAlertDemo from './SafetyAlertDemo';

export default function PersonalizedSafetyDashboard() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: profiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ['safety-profiles'],
    queryFn: () => base44.entities.SafetyProfile.list(),
    initialData: []
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['safety-alerts'],
    queryFn: () => base44.entities.SafetyAlert.list('-created_date', 50),
    initialData: []
  });

  const defaultProfile = profiles.find(p => p.is_default);
  const recentAlerts = alerts.slice(0, 5);

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowProfileModal(true);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setShowProfileModal(true);
  };

  const handleProfileSaved = () => {
    setShowProfileModal(false);
    setEditingProfile(null);
    refetchProfiles();
  };

  // Calculate stats
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highAlerts = alerts.filter(a => a.severity === 'high').length;
  const totalFlagged = alerts.reduce((sum, alert) => sum + (alert.flagged_ingredients?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-pink-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <HeartPulse className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Safety Profiles
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Your personalized health guardian
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleCreateProfile}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 px-6 py-6 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Profile
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -mr-8 -mt-8"></div>
              <CardContent className="p-5 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Active Profiles</p>
                <p className="text-3xl sm:text-4xl font-bold text-blue-900">{profiles.length}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full -mr-8 -mt-8"></div>
              <CardContent className="p-5 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 font-medium mb-1">Total Alerts</p>
                <p className="text-3xl sm:text-4xl font-bold text-amber-900">{alerts.length}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-red-50 to-rose-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/30 rounded-full -mr-8 -mt-8"></div>
              <CardContent className="p-5 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-red-700 font-medium mb-1">Critical Alerts</p>
                <p className="text-3xl sm:text-4xl font-bold text-red-900">{criticalAlerts}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/30 rounded-full -mr-8 -mt-8"></div>
              <CardContent className="p-5 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-purple-700 font-medium mb-1">Ingredients Flagged</p>
                <p className="text-3xl sm:text-4xl font-bold text-purple-900">{totalFlagged}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profiles */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Profiles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Safety Profiles
                </h2>
              </div>

              {profiles.length === 0 ? (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 to-pink-100/20 opacity-50"></div>
                  <CardContent className="p-12 sm:p-16 text-center relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/30">
                      <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No Profiles Yet</h3>
                    <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                      Create your first safety profile to start receiving personalized alerts about products that may affect your health
                    </p>
                    <Button 
                      onClick={handleCreateProfile}
                      className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 px-8 py-6 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {profiles.map((profile, idx) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                    >
                      <ProfileCard
                        profile={profile}
                        onEdit={handleEditProfile}
                        onRefetch={refetchProfiles}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Alerts */}
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AlertsHistory alerts={recentAlerts} />
              </motion.div>
            )}
          </div>

          {/* Right Column - Insights */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SafetyInsights alerts={alerts} profiles={profiles} />
            </motion.div>

            {/* Test Alert System */}
            {defaultProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SafetyAlertDemo profile={defaultProfile} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileSetupModal
            profile={editingProfile}
            onClose={() => {
              setShowProfileModal(false);
              setEditingProfile(null);
            }}
            onSave={handleProfileSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}