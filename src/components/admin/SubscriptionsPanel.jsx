import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, User, RefreshCw, Search, CheckCircle2, XCircle, Clock, CalendarClock, Mail, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PLAN_CONFIG = {
  pro: { label: 'Pro', color: 'bg-teal-600 text-white', icon: Crown },
  enterprise: { label: 'Enterprise', color: 'bg-violet-600 text-white', icon: Crown },
  lifetime: { label: 'Lifetime', color: 'bg-amber-500 text-white', icon: Crown },
  trial: { label: 'Trial', color: 'bg-slate-200 text-slate-700', icon: Clock },
  free: { label: 'Free', color: 'bg-slate-200 text-slate-700', icon: User },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  trialing: { label: 'Trialing', color: 'bg-blue-100 text-blue-700', icon: Clock },
  canceled: { label: 'Canceled', color: 'bg-red-100 text-red-700', icon: XCircle },
  past_due: { label: 'Past Due', color: 'bg-orange-100 text-orange-700', icon: XCircle },
};

function getDaysLeft(user) {
  const endRaw = user.subscription_period_end || user.subscription_end_date ||
                 user.data?.subscription_period_end || user.data?.subscription_end_date;
  if (!endRaw) return null;
  const end = new Date(endRaw);
  const now = new Date();
  const days = Math.ceil((end - now) / (24 * 60 * 60 * 1000));
  return days;
}

export default function SubscriptionsPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [sendingReminder, setSendingReminder] = useState(null); // userId being emailed
  const [reminderSent, setReminderSent] = useState({}); // {userId: true}

  const sendManualReminder = async (userId) => {
    setSendingReminder(userId);
    try {
      await base44.functions.invoke('sendProExpirationEmail', { manual: true, targetUserId: userId });
      setReminderSent(prev => ({ ...prev, [userId]: true }));
      setTimeout(() => setReminderSent(prev => { const n = { ...prev }; delete n[userId]; return n; }), 5000);
    } catch (e) {
      console.error('Failed to send reminder:', e);
    } finally {
      setSendingReminder(null);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await base44.entities.User.list('-created_date', 500);
      setUsers(allUsers);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 15 seconds for near-real-time updates
    const interval = setInterval(fetchUsers, 15000);

    // Real-time subscription to user changes
    const unsubscribe = base44.entities.User.subscribe((event) => {
      if (event.type === 'update' || event.type === 'create') {
        setUsers(prev => {
          if (event.type === 'create') return [event.data, ...prev];
          return prev.map(u => u.id === event.id ? event.data : u);
        });
        setLastRefreshed(new Date());
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const plan = u.data?.subscription_plan || u.subscription_plan || 'free';
    const isPro = plan === 'pro' || plan === 'enterprise' || plan === 'lifetime';
    const matchFilter =
    filter === 'all' ? true :
    filter === 'pro' ? isPro :
    filter === 'free' ? !isPro : true;
    return matchSearch && matchFilter;
    });

    const proCount = users.filter(u => {
    const plan = u.data?.subscription_plan || u.subscription_plan;
    return plan === 'pro' || plan === 'enterprise' || plan === 'lifetime';
    }).length;
    const freeCount = users.length - proCount;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-700">{proCount}</p>
              <p className="text-sm text-teal-600">Pro Subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-700">{freeCount}</p>
              <p className="text-sm text-slate-600">Free Tier Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-700">{users.length}</p>
              <p className="text-sm text-violet-600">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 sm:col-span-3">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-700">Pro Subscriptions Expiring Soon (≤10 days)</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {users.filter(u => {
                  const plan = u.data?.subscription_plan || u.subscription_plan;
                  const isPro = plan === 'pro' || plan === 'enterprise';
                  const days = getDaysLeft(u);
                  return isPro && days !== null && days <= 10 && days >= 0;
                }).length === 0 ? (
                  <span className="text-xs text-orange-500">No subscriptions expiring in the next 10 days</span>
                ) : (
                  users.filter(u => {
                    const plan = u.data?.subscription_plan || u.subscription_plan;
                    const isPro = plan === 'pro' || plan === 'enterprise';
                    const days = getDaysLeft(u);
                    return isPro && days !== null && days <= 10 && days >= 0;
                  }).map(u => (
                    <span key={u.id} className="text-xs bg-orange-100 text-orange-800 border border-orange-200 rounded-full px-2 py-0.5 font-semibold">
                      {u.full_name || u.email} — {getDaysLeft(u)}d left
                    </span>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {['all', 'pro', 'free'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'pro' ? '⭐ Pro' : '🆓 Free'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      {lastRefreshed && (
        <p className="text-xs text-slate-400">Last refreshed: {lastRefreshed.toLocaleTimeString()} · Auto-refreshes every 15s · Real-time updates active</p>
      )}

      {/* User Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Billing</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Days Left</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No users found</td></tr>
              ) : filtered.map(u => {
                const plan = u.data?.subscription_plan || u.subscription_plan || 'free';
                const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
                const subStatus = u.data?.subscription_status || u.subscription_status;
                const subBilling = u.data?.subscription_billing || u.subscription_billing;
                const statusCfg = STATUS_CONFIG[subStatus || 'trialing'] || STATUS_CONFIG.trialing;
                const StatusIcon = statusCfg.icon;
                const PlanIcon = planCfg.icon;
                const isPro = plan === 'pro' || plan === 'enterprise' || plan === 'lifetime';
                const daysLeft = isPro ? getDaysLeft(u) : null;
                const isExpiringSoon = daysLeft !== null && daysLeft <= 10 && daysLeft >= 0;
                const isExpired = daysLeft !== null && daysLeft < 0;
                return (
                  <tr key={u.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isExpiringSoon ? 'bg-orange-50/40' : isPro ? 'bg-teal-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isPro ? 'bg-teal-600' : 'bg-slate-400'}`}>
                          {(u.full_name || u.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.full_name || '—'}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                        {isPro && <Crown className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${planCfg.color}`}>
                        <PlanIcon className="w-3 h-3" />
                        {planCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {subBilling || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {daysLeft === null ? (
                        <span className="text-slate-400 text-xs">—</span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <XCircle className="w-3 h-3" /> Expired
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300">
                          <AlertTriangle className="w-3 h-3" /> {daysLeft}d left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> {daysLeft}d left
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {u.created_date ? new Date(u.created_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isPro && daysLeft !== null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={sendingReminder === u.id}
                                onClick={() => sendManualReminder(u.id)}
                                className={`h-7 text-xs px-2 ${reminderSent[u.id] ? 'border-green-400 text-green-700' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}
                              >
                                {reminderSent[u.id] ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" />Sent</>
                                ) : sendingReminder === u.id ? (
                                  <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Sending...</>
                                ) : (
                                  <><Mail className="w-3 h-3 mr-1" />Send Reminder</>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Send renewal reminder email to {u.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}