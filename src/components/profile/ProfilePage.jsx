import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../auth/AuthContext';
import { getUserStats } from '@/functions/getUserStats';
import { base44 } from '@/api/base44Client';
import useTrialStatus from '../../hooks/useTrialStatus';
import EditProfileModal from './EditProfileModal';
import NotificationCenter from '../notifications/NotificationCenter';
import {
  User as UserIcon, Edit2, Settings, Star, Crown, Gem,
  FlaskConical, TestTube, QrCode, Cpu,
  Loader2, Clock, FileText, Zap, Check, Lock,
  Bell, ArrowUpRight, Sparkles, TrendingUp, Activity,
  ChevronRight, BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ProfilePage() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const trialStatus = useTrialStatus(user);
  const [stats, setStats] = useState({ totalFormulas: 0, totalSimulations: 0, totalScans: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isPro = trialStatus.isPro;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const [statsData, formulas, simulations] = await Promise.all([
          getUserStats(),
          base44.entities.Formula.list('-updated_date', 6),
          base44.entities.Simulation.list('-created_date', 6),
        ]);
        if (statsData?.data) setStats(statsData.data);
        const merged = [
          ...(formulas || []).map(f => ({ ...f, _type: 'Formula', _icon: FlaskConical, _color: 'bg-violet-100 text-violet-600' })),
          ...(simulations || []).map(s => ({ ...s, _type: 'Simulation', _icon: TestTube, _color: 'bg-teal-100 text-teal-600' })),
        ].sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date)).slice(0, 4);
        setRecentItems(merged);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [user]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!user) return null;

  const firstName = user.display_name || user.full_name?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-3xl px-8 py-8 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute bottom-0 left-16 w-32 h-32 rounded-full bg-white/20 blur-xl" />
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-6">
            {/* Avatar + Name */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/30 shadow-lg">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                      <UserIcon className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-slate-700" />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-white">
                    {getGreeting()}, {firstName}
                  </h1>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-900">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                      Free Plan
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-sm">
                  {user.role === 'admin' ? 'Administrator' : user.email}
                </p>
              </div>
            </div>

            {/* Right: Points + Actions */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('ReviewRewards')}>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 hover:bg-white/25 transition-all">
                  <Star className="w-4 h-4 text-amber-300" />
                  <div>
                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest leading-none">Points</p>
                    <p className="text-xl font-bold text-white leading-tight">{user.reward_points || 0}</p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setShowNotifications(true)}
                className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 hover:bg-white/25 flex items-center justify-center transition-all"
              >
                <Bell className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => navigate(createPageUrl('Settings'))}
                className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 hover:bg-white/25 flex items-center justify-center transition-all"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Upgrade Banner (Free users only) ── */}
        {!isPro && (
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-6 py-5 shadow-md">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-amber-300" />
                  <span className="font-bold text-white text-base">Upgrade to Suttain Pro</span>
                </div>
                <p className="text-violet-200 text-sm max-w-sm">
                  Unlock unlimited simulations, AI compliance tools, sustainability scoring and more.
                </p>
              </div>
              <Link
                to={createPageUrl('Pricing')}
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-violet-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow hover:shadow-md hover:bg-violet-50 transition-all"
              >
                <Zap className="w-4 h-4" /> Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Formulas', value: isLoading ? '—' : (stats.totalFormulas ?? 0), icon: FlaskConical, gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50', text: 'text-violet-600' },
            { label: 'Simulations', value: isLoading ? '—' : (stats.totalSimulations ?? 0), icon: TestTube, gradient: 'from-teal-500 to-emerald-600', light: 'bg-teal-50', text: 'text-teal-600' },
            { label: 'Scans', value: isLoading ? '—' : (stats.totalScans ?? 0), icon: QrCode, gradient: 'from-cyan-500 to-blue-600', light: 'bg-cyan-50', text: 'text-cyan-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 px-4 py-4 flex flex-col items-center text-center gap-2 shadow-sm hover:shadow-md transition-shadow sm:flex-row sm:items-center sm:text-left sm:gap-4 sm:px-6 sm:py-5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Activity Highlights + Plan ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity as Highlights */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h2>
              </div>
              <Link to={createPageUrl('Workspace')} className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12 bg-white rounded-2xl border border-slate-100">
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
              </div>
            ) : recentItems.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
                <FileText className="w-8 h-8 mx-auto mb-3 text-slate-200" />
                <p className="text-sm text-slate-400">No activity yet. Start by creating a formula or running a simulation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentItems.map((item, i) => {
                  const Icon = item._icon;
                  const isFormula = item._type === 'Formula';
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${item._color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' :
                          isFormula ? 'bg-violet-100 text-violet-600' : 'bg-teal-100 text-teal-600'
                        }`}>
                          {item.status || item._type}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate mb-1">{item.name || item.title || item.chemicals_input || 'Untitled'}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {timeAgo(item.updated_date || item.created_date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Plan</h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Plan Header */}
              <div className={`px-5 py-4 ${isPro ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPro ? 'bg-white/25' : 'bg-white'}`}>
                    {isPro ? <Crown className="w-5 h-5 text-white" /> : <Gem className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <p className={`font-bold text-base ${isPro ? 'text-white' : 'text-slate-700'}`}>{isPro ? 'Premium Plan' : 'Free Plan'}</p>
                    <p className={`text-xs ${isPro ? 'text-white/75' : 'text-slate-400'}`}>{isPro ? 'Full access' : 'Limited access'}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="px-5 py-4 space-y-2.5">
                {isPro ? (
                  ['Unlimited simulations', 'AI compliance tools', 'Sustainability scoring', 'Priority support', 'Advanced analytics'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                    </div>
                  ))
                ) : (
                  ['Unlimited simulations', 'AI compliance tools', 'Sustainability scoring', 'Priority support'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <Lock className="w-4 h-4 flex-shrink-0" /> {f}
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-slate-100">
                {isPro ? (
                  <>
                    <Link to={createPageUrl('Settings')}
                      className="flex items-center justify-between text-sm font-semibold text-teal-700 hover:text-teal-800 py-2 transition-colors">
                      Manage Billing <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link to={createPageUrl('Pricing')}
                      className="flex items-center justify-between text-sm text-slate-400 hover:text-slate-600 py-1 transition-colors">
                      View all plans <ChevronRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <Link to={createPageUrl('Pricing')}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow">
                    <Crown className="w-4 h-4" /> Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>

            {/* Quick nav to settings */}
            <Link to={createPageUrl('Settings')} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md transition-all group">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                <Settings className="w-4 h-4 text-slate-500 group-hover:text-teal-600 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Account Settings</p>
                <p className="text-xs text-slate-400">Profile, billing, safety profiles</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
            </Link>
          </div>
        </div>

      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}