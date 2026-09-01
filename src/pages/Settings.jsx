import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../components/auth/AuthContext';
import NotificationPreferences from '../components/notifications/NotificationPreferences';
import AccountDeletionSection from '../components/settings/AccountDeletionSection';
import SubscriptionCard from '../components/profile/SubscriptionCard';
import BillingHistory from '../components/profile/BillingHistory';
import {
  ArrowLeft, CreditCard, Bell, Trash2, User, ChevronRight, Crown, Check
} from 'lucide-react';

const TABS = [
  { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account', icon: User },
];

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('billing');

  if (!user) {
    return <div className="text-center py-10 text-gray-600">Please log in to view your settings.</div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your subscription, billing, and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    {user.profile_image_url ? (
                      <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.full_name || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <nav className="py-2">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'billing' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <SectionHeader title="Billing & Subscription" description="Manage your plan, billing cycle, and payment details." />
                  <Link to={createPageUrl('BillingDashboard')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                    View Full Dashboard <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <SubscriptionCard />
                <BillingInfo user={user} />
                <BillingHistory />
              </div>
            )}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <SectionHeader title="Notifications" description="Control which alerts and updates you receive." />
                <NotificationPreferences />
              </div>
            )}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <SectionHeader title="Account" description="Manage your account data and deletion preferences." />
                <AccountDeletionSection user={user} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="pb-2">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-0.5">{description}</p>
    </div>
  );
}

function BillingInfo({ user }) {
  const isLifetime = user?.subscription_billing === 'lifetime';
  const isMonthly = user?.subscription_billing === 'monthly';
  const isYearly = user?.subscription_billing === 'yearly';
  const isPro = user?.subscription_plan === 'pro' || user?.role === 'admin';

  if (!isPro) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Billing Information</h3>
        <p className="text-sm text-slate-400">No active subscription. Upgrade to Pro to see billing details.</p>
        <Link to={createPageUrl('Pricing')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:underline">
          View pricing plans <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const billingLabel = isLifetime ? 'One-time payment (Lifetime)' : isYearly ? 'Annual billing ($49.99/yr)' : 'Monthly billing ($4.99/mo)';
  const nextBillingLabel = isLifetime ? 'Never, lifetime access' :
    (user?.subscription_cancel_at
      ? `Access until ${new Date(user.subscription_cancel_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      : 'Auto-renews at next cycle');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
      <div className="px-6 py-4">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Billing Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Plan</p>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-slate-800 capitalize">{user?.subscription_plan || 'Pro'} Plan</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Billing Cycle</p>
            <p className="text-sm font-semibold text-slate-800">{billingLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              user?.subscription_status === 'canceling' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user?.subscription_status === 'canceling' ? 'bg-yellow-500' : 'bg-green-500'}`} />
              {user?.subscription_status === 'canceling' ? 'Canceling' : 'Active'}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Next Billing</p>
            <p className="text-sm font-semibold text-slate-800">{nextBillingLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">What's Included</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {['Unlimited simulations', 'AI compliance co-pilot', 'Sustainability scoring', 'PDF & lab report export', 'Priority support', 'Advanced analytics'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">Need help with your subscription?</p>
        <a href="mailto:contact@suttain.com" className="text-xs font-semibold text-teal-600 hover:underline">
          Contact support
        </a>
      </div>
    </div>
  );
}