import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../components/auth/AuthContext';
import SafetyProfileManager from '../components/profile/SafetyProfileManager';
import NotificationPreferences from '../components/notifications/NotificationPreferences';
import AccountDeletionSection from '../components/settings/AccountDeletionSection';
import SubscriptionCard from '../components/profile/SubscriptionCard';

export default function Settings() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="text-center py-10 text-gray-600">Please log in to view your settings.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Link to={createPageUrl('Profile')} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your subscription, safety profiles, notification preferences, and other account settings.</p>

          {/* Subscription Management */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Subscription & Billing</h2>
            <SubscriptionCard />
          </div>
          
          <SafetyProfileManager />
          <NotificationPreferences />
          
          <AccountDeletionSection user={user} />
        </motion.div>
      </div>
    </div>
  );
}