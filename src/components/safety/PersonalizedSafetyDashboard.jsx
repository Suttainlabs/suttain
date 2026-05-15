import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { HeartPulse, Plus, Shield, Activity, TrendingUp, AlertTriangle, UserPlus, ArrowRight } from 'lucide-react';
import ProfileSetupModal from './ProfileSetupModal';
import ProfileCard from './ProfileCard';
import AlertsHistory from './AlertsHistory';
import SafetyInsights from './SafetyInsights';
import SafetyAlertDemo from './SafetyAlertDemo';
import TwilioAlertSettings from '@/components/twilio/TwilioAlertSettings';

const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </CardContent>
  </Card>
);

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

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const totalFlagged = alerts.reduce((sum, alert) => sum + (alert.flagged_ingredients?.length || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Safety Profiles
              </h1>
            </div>
            <p className="text-slate-500 mt-1 ml-[52px]">
              Personalized health monitoring and ingredient alerts
            </p>
          </div>
          <Button 
            onClick={handleCreateProfile}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Profile
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          <StatCard 
            icon={UserPlus} 
            label="Active Profiles" 
            value={profiles.length}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard 
            icon={Activity} 
            label="Total Alerts" 
            value={alerts.length}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Critical Alerts" 
            value={criticalAlerts}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Ingredients Flagged" 
            value={totalFlagged}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column — Profiles */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Your Profiles
              </h2>

              {profiles.length === 0 ? (
                <Card className="border border-dashed border-slate-300 shadow-none">
                  <CardContent className="p-10 sm:p-14 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <UserPlus className="w-7 h-7 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No profiles yet</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                      Create a safety profile to receive personalized alerts about ingredients that may affect your health.
                    </p>
                    <Button 
                      onClick={handleCreateProfile}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-6"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile, idx) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Recent Alerts
                </h2>
                <AlertsHistory alerts={recentAlerts} />
              </motion.div>
            )}
          </div>

          {/* Right Column — Insights */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Insights
              </h2>
              <SafetyInsights alerts={alerts} profiles={profiles} />
            </motion.div>

            {defaultProfile && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <SafetyAlertDemo profile={defaultProfile} />
              </motion.div>
            )}

            {/* Twilio SMS/WhatsApp Alert Settings */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  SMS / WhatsApp Alerts
                </h2>
                <TwilioAlertSettings user={user} />
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