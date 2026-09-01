import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../auth/AuthContext';
import { getUserStats } from '@/functions/getUserStats';
import { base44 } from '@/api/base44Client';
import useTrialStatus from '../../hooks/useTrialStatus';
import usePullToRefresh from '../../hooks/usePullToRefresh';
import EditProfileModal from './EditProfileModal';
import NotificationCenter from '../notifications/NotificationCenter';
import DashboardGreeting from '../dashboard/DashboardGreeting';
import StatRow from '../dashboard/StatRow';
import QuickLaunchers from '../dashboard/QuickLaunchers';
import RecentActivityList from '../dashboard/RecentActivityList';
import SupervisorApprovalsPanel from '../dashboard/SupervisorApprovalsPanel';
import { Crown, Zap, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const trialStatus = useTrialStatus(user);
  const [stats, setStats] = useState({ totalFormulas: 0, totalSimulations: 0, totalScans: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isPro = trialStatus.isPro;

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const statsData = await getUserStats();
      if (statsData?.data) setStats(statsData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    base44.entities.Notification.filter({ is_read: false })
      .then((n) => { if (active) setUnreadCount(n?.length || 0); })
      .catch(() => {});
    return () => { active = false; };
  }, [user]);

  const { isRefreshing } = usePullToRefresh(fetchData);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      {isRefreshing && (
        <div className="flex justify-center py-2 bg-slate-50 sticky top-16 z-10">
          <div className="w-4 h-4 border-2 border-slate-200 border-t-[#02988C] rounded-full animate-spin" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">

        <DashboardGreeting
          user={user}
          isPro={isPro}
          unreadCount={unreadCount}
          onEdit={() => setIsEditModalOpen(true)}
          onNotifications={() => setShowNotifications(true)}
          onSettings={() => navigate(createPageUrl('Settings'))}
        />

        <StatRow stats={stats} isLoading={isLoading} />

        <QuickLaunchers />

        <RecentActivityList />

        <SupervisorApprovalsPanel />

        {!isPro ? (
          <div className="bg-gradient-to-r from-[#02988C] to-teal-600 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
                <p className="text-xs text-white/80">Unlimited simulations, compliance tools, and sustainability scoring.</p>
              </div>
            </div>
            <Link
              to={createPageUrl('Pricing')}
              className="inline-flex items-center gap-1.5 bg-white text-[#02988C] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" /> Upgrade
            </Link>
          </div>
        ) : (
          <Link
            to={createPageUrl('BillingDashboard')}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Pro plan</p>
                <p className="text-xs text-slate-400">Manage billing and subscription</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        )}
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}