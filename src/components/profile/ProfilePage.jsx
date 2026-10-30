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
import RecentActivityList from '../dashboard/RecentActivityList';
import PremiumFeatureGate from '@/components/shared/PremiumFeatureGate';
import SupervisorApprovalsPanel from '../dashboard/SupervisorApprovalsPanel';
import useActivitySeries from '../dashboard/useActivitySeries';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Crown, Zap, ChevronRight, Bell, Settings, Edit2, TestTube, FlaskConical, QrCode,
  FileText, Atom, ArrowUpRight, Plus, Gauge,
} from 'lucide-react';

const SERIES = [
  { key: 'simulation', label: 'Analyses', color: 'hsl(175 97% 30%)' },
  { key: 'formula', label: 'Formulas', color: 'hsl(199 70% 42%)' },
  { key: 'scan', label: 'Scans', color: 'hsl(38 85% 50%)' },
];

const QUICK_ACTIONS = [
  { to: '/BarcodeScanner', label: 'Scan a product', text: 'Barcode or ingredient photo', icon: QrCode },
  { to: '/Simulator', label: 'Check a mixture', text: 'Chemical interaction analysis', icon: TestTube },
  { to: '/generator', label: 'Build a formula', text: 'Safer recipe, costed and checked', icon: FlaskConical },
  { to: '/SDSAnalyzer', label: 'Decode an SDS', text: 'Hazards in plain language', icon: FileText },
  { to: '/ResearchPortal', label: 'Research tools', text: 'Atomistic, docking, ADMET', icon: Atom },
];

function KpiCard({ icon: Icon, label, value, sub, loading, href }) {
  const body = (
    <div className="group h-full rounded-xl border border-research-border bg-research-card p-4 sm:p-5 transition-colors hover:border-research-accent/40">
      <div className="flex items-center justify-between gap-2">
        <span className="research-label">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-research-soft text-research-accent"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 text-2xl sm:text-3xl font-semibold tabular-nums text-research-text leading-none">
        {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-research-soft" /> : value}
      </p>
      <p className="mt-2 text-xs text-research-muted min-h-4">{sub}</p>
    </div>
  );
  return href ? <Link to={href} className="block h-full">{body}</Link> : body;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-research-border bg-research-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-research-text mb-1">{label}</p>
      {payload.map(p => <p key={p.dataKey} className="flex items-center gap-2 text-research-muted"><span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />{p.name}: <span className="text-research-text tabular-nums">{p.value}</span></p>)}
    </div>
  );
}

export default function ProfilePage({ children }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const trialStatus = useTrialStatus(user);
  const [stats, setStats] = useState({ totalFormulas: 0, totalSimulations: 0, totalScans: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const activity = useActivitySeries(user, 30);

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

  const firstName = user?.display_name || user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const last30 = (k) => activity.loading ? '' : `${activity.totals[k]} in the last 30 days`;
  const totalLast30 = activity.totals.simulation + activity.totals.formula + activity.totals.scan;

  const usage = trialStatus.usage || {};
  const limits = trialStatus.limits || {};
  const usageRows = [
    { label: 'Chemical analyses', used: usage.simulations || 0, limit: limits.simulations },
    { label: 'Formulas', used: usage.formulas || 0, limit: limits.formulas },
    { label: 'Research simulations', used: usage.researchSimulations || 0, limit: limits.researchSimulations },
  ].filter(r => Number.isFinite(r.limit));

  return (
    <div className="research-surface consumer-theme min-h-screen">
      {isRefreshing && (
        <div className="flex justify-center py-2 sticky top-16 z-10">
          <div className="w-4 h-4 border-2 border-research-border border-t-research-accent rounded-full animate-spin" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-research-border pb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="h-14 w-14 overflow-hidden rounded-xl border border-research-border bg-research-soft">
                {user?.profile_image_url
                  ? <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-research-accent">{firstName.charAt(0).toUpperCase()}</div>}
              </div>
              <button onClick={() => setIsEditModalOpen(true)} aria-label="Edit profile" className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-research-border bg-research-card hover:bg-research-soft">
                <Edit2 className="h-3 w-3 text-research-muted" />
              </button>
            </div>
            <div className="min-w-0">
              <p className="research-label mb-1">Dashboard</p>
              <h1 className="!text-xl sm:!text-2xl truncate">{greeting}, {firstName}</h1>
              <p className="text-sm text-research-muted truncate">
                {isPro ? 'Pro plan' : 'Free plan'} · {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotifications(true)} aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-research-border bg-research-card hover:bg-research-soft">
              <Bell className="h-4 w-4 text-research-muted" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            <button onClick={() => navigate(createPageUrl('Settings'))} aria-label="Settings" className="flex h-11 w-11 items-center justify-center rounded-lg border border-research-border bg-research-card hover:bg-research-soft">
              <Settings className="h-4 w-4 text-research-muted" />
            </button>
            <Link to="/ConsumerPortal" className="research-primary inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium flex-1 sm:flex-none justify-center">
              <Plus className="h-4 w-4" /> New analysis
            </Link>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard icon={TestTube} label="Analyses" value={stats.totalSimulations ?? 0} sub={last30('simulation')} loading={isLoading} href="/Simulator" />
          <KpiCard icon={FlaskConical} label="Formulas" value={stats.totalFormulas ?? 0} sub={last30('formula')} loading={isLoading} href="/FormulaPortfolio" />
          <KpiCard icon={QrCode} label="Scans" value={stats.totalScans ?? 0} sub={last30('scan')} loading={isLoading} href="/BarcodeScanner" />
          <KpiCard icon={Gauge} label="Plan" value={isPro ? 'Pro' : 'Free'} sub={isPro ? 'Unlimited core tools' : `${usage.simulations || 0} of ${limits.simulations ?? '–'} analyses used`} href={isPro ? createPageUrl('BillingDashboard') : createPageUrl('Pricing')} />
        </div>

        {/* Chart + quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          <section aria-labelledby="activity-heading" className="lg:col-span-2 rounded-xl border border-research-border bg-research-card p-4 sm:p-6 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h2 id="activity-heading" className="!text-base">Activity</h2>
                <p className="text-sm text-research-muted">{activity.loading ? 'Loading…' : `${totalLast30} runs in the last 30 days`}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {SERIES.map(s => <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-research-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />{s.label}</span>)}
              </div>
            </div>
            <div className="h-56 sm:h-64">
              {activity.loading ? (
                <div className="h-full animate-pulse rounded-lg bg-research-soft" />
              ) : totalLast30 === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-research-border text-center px-6">
                  <p className="text-sm font-medium text-research-text">No activity in the last 30 days</p>
                  <p className="text-xs text-research-muted mt-1">Scan a product or check a mixture and it will show up here.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity.series} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid vertical={false} stroke="hsl(var(--research-border))" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} interval={6} tick={{ fontSize: 11, fill: 'hsl(var(--research-muted))' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--research-muted))' }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--research-soft))' }} />
                    {SERIES.map((s, i) => <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color} radius={i === SERIES.length - 1 ? [3, 3, 0, 0] : 0} />)}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section aria-labelledby="quick-heading" className="rounded-xl border border-research-border bg-research-card p-4 sm:p-6">
            <h2 id="quick-heading" className="!text-base mb-3">Start something</h2>
            <ul className="divide-y divide-research-border -mx-1">
              {QUICK_ACTIONS.map(({ to, label, text, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="group flex items-center gap-3 rounded-lg px-1 py-3 min-h-11 hover:bg-research-soft/60">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-research-soft text-research-accent"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-research-text">{label}</span>
                      <span className="block text-xs text-research-muted truncate">{text}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-research-muted group-hover:text-research-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Recent activity + plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-2 min-w-0">
            <PremiumFeatureGate featureName="Saved history"><RecentActivityList /></PremiumFeatureGate>
          </div>

          <div className="space-y-4 min-w-0">
            {!isPro ? (
              <section className="rounded-xl border border-research-border bg-research-card p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-1"><Crown className="h-4 w-4 text-research-accent" /><h2 className="!text-base">Free plan usage</h2></div>
                <p className="text-xs text-research-muted mb-4">This month</p>
                <div className="space-y-4">
                  {usageRows.map(r => {
                    const pct = r.limit ? Math.min(100, Math.round((r.used / r.limit) * 100)) : 0;
                    return (
                      <div key={r.label}>
                        <div className="flex justify-between text-sm mb-1.5"><span className="text-research-text">{r.label}</span><span className="tabular-nums text-research-muted">{r.used} / {r.limit}</span></div>
                        <div className="h-1.5 rounded-full bg-research-soft overflow-hidden" role="progressbar" aria-valuenow={r.used} aria-valuemin={0} aria-valuemax={r.limit} aria-label={r.label}>
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-600' : 'bg-research-accent'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to={createPageUrl('Pricing')} className="research-primary mt-5 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium">
                  <Zap className="h-4 w-4" /> Upgrade to Pro
                </Link>
              </section>
            ) : (
              <Link to={createPageUrl('BillingDashboard')} className="flex items-center justify-between rounded-xl border border-research-border bg-research-card p-4 sm:p-5 hover:border-research-accent/40">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-research-soft text-research-accent"><Crown className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-medium text-research-text">Pro plan</span><span className="block text-xs text-research-muted">Manage billing and subscription</span></span>
                </span>
                <ChevronRight className="h-4 w-4 text-research-muted" />
              </Link>
            )}
            <SupervisorApprovalsPanel />
          </div>
        </div>

        {children}
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}
