import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  FlaskConical, TestTube, QrCode, Cpu, BarChart2, Leaf,
  ChevronRight, Loader2, Clock, FileText, Zap, Check, Lock,
  Bell, ArrowUpRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUICK_TOOLS = [
  { label: "Simulator", icon: TestTube, color: "bg-teal-500", href: "Simulator" },
  { label: "Formula Generator", icon: FlaskConical, color: "bg-violet-500", href: "generator" },
  { label: "SuttainScan", icon: QrCode, color: "bg-cyan-500", href: "BarcodeScanner" },
  { label: "Sim Engine", icon: Cpu, color: "bg-indigo-500", href: "SimulationEngine" },
  { label: "Impact Report", icon: BarChart2, color: "bg-amber-500", href: "ComparativeImpactReport" },
  { label: "Sustainability", icon: Leaf, color: "bg-green-500", href: "SustainabilityImpact" },
];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
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
          base44.entities.Formula.list('-updated_date', 5),
          base44.entities.Simulation.list('-created_date', 5),
        ]);
        if (statsData?.data) setStats(statsData.data);
        // Merge and sort recent items
        const merged = [
          ...(formulas || []).map(f => ({ ...f, _type: 'Formula', _icon: FlaskConical, _color: 'bg-violet-100 text-violet-600' })),
          ...(simulations || []).map(s => ({ ...s, _type: 'Simulation', _icon: TestTube, _color: 'bg-teal-100 text-teal-600' })),
        ].sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date)).slice(0, 6);
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
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-7">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-slate-600" />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900">
                    {getGreeting()}, {firstName}
                  </h1>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                      <Gem className="w-3 h-3" /> Free
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  {user.role === 'admin' ? 'Administrator' : user.simulator_category ? user.simulator_category.charAt(0).toUpperCase() + user.simulator_category.slice(1) : 'User Dashboard'}
                </p>
              </div>
            </div>

            {/* Right: Points + Settings */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('ReviewRewards')}>
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl px-4 py-2 shadow hover:shadow-md transition-all">
                  <Star className="w-4 h-4 text-white" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest leading-none">Points</p>
                    <p className="text-lg font-bold text-white leading-tight">{user.reward_points || 0}</p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setShowNotifications(true)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <Bell className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => navigate(createPageUrl('Settings'))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Upgrade Banner (Free users only) ── */}
        {!isPro && (
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-6 py-5 shadow-md">
            <div className="absolute right-0 top-0 w-48 h-full opacity-10">
              <Sparkles className="w-full h-full text-white" />
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-amber-300" />
                  <span className="font-bold text-white text-base">Upgrade to Suttain Pro</span>
                </div>
                <p className="text-violet-200 text-sm max-w-sm">
                  Unlock unlimited simulations, AI compliance tools, sustainability scoring and more.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
                  {['Unlimited simulations', 'AI compliance co-pilot', 'Priority support'].map(f => (
                    <span key={f} className="flex items-center gap-1 text-xs text-violet-100">
                      <Check className="w-3.5 h-3.5 text-green-300 flex-shrink-0" /> {f}
                    </span>
                  ))}
                </div>
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
            { label: 'Formulas', value: isLoading ? '—' : (stats.totalFormulas ?? 0), icon: FlaskConical, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
            { label: 'Simulations', value: isLoading ? '—' : (stats.totalSimulations ?? 0), icon: TestTube, color: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
            { label: 'Scans', value: isLoading ? '—' : (stats.totalScans ?? 0), icon: QrCode, color: 'bg-cyan-50 text-cyan-600', border: 'border-cyan-100' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`bg-white rounded-2xl border ${s.border} px-5 py-4 flex items-center gap-3 shadow-sm`}>
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Quick Access ── */}
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Access</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_TOOLS.map(t => {
              const Icon = t.icon;
              return (
                <Link key={t.label} to={createPageUrl(t.href)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className={`w-11 h-11 rounded-xl ${t.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{t.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Recent Activity + Plan Details side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</p>
              <Link to={createPageUrl('Workspace')} className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : recentItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity yet. Start by creating a formula or running a simulation.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentItems.map((item, i) => {
                  const Icon = item._icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className={`w-9 h-9 rounded-lg ${item._color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.name || 'Untitled'}</p>
                        <p className="text-xs text-slate-400">{item._type}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.status && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {item.status}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(item.updated_date || item.created_date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan Card */}
          <div className="bg-white rounded-2xl border border-slate-100 px-6 py-5 shadow-sm flex flex-col">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Plan</p>

            {isPro ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Premium Plan</p>
                    <p className="text-xs text-amber-600 font-medium">Full access</p>
                  </div>
                </div>
                <div className="space-y-2 mt-1 flex-1">
                  {['Unlimited simulations', 'AI compliance tools', 'Sustainability scoring', 'Priority support', 'Advanced analytics'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1.5">
                  <Link to={createPageUrl('Pricing')}
                    className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1 transition-colors">
                    View plans &amp; pricing <ChevronRight className="w-3 h-3" />
                  </Link>
                  <Link to={createPageUrl('Settings')}
                    className="text-xs text-slate-500 hover:text-teal-600 font-medium flex items-center gap-1 transition-colors">
                    Manage subscription <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Gem className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Free Plan</p>
                    <p className="text-xs text-slate-400">Limited access</p>
                  </div>
                </div>
                <div className="space-y-2 mt-1 flex-1">
                  {[
                    { label: 'Unlimited simulations', locked: true },
                    { label: 'AI compliance tools', locked: true },
                    { label: 'Sustainability scoring', locked: true },
                    { label: 'Priority support', locked: true },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2 text-sm text-slate-400">
                      <Lock className="w-4 h-4 flex-shrink-0" /> {f.label}
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl('Pricing')}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow">
                  <Crown className="w-4 h-4" /> Upgrade to Pro
                </Link>
              </>
            )}
          </div>
        </div>

      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}