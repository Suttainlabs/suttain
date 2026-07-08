import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  Users, UserCheck, Clock, AlertTriangle, Search, Trash2,
  Sparkles, MoreVertical, RotateCcw, Ban, Loader2, Inbox,
  Crown, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import GrantAccessModal from './GrantAccessModal';

// ── Helpers ──────────────────────────────────────────────────────────

function getDaysLeft(endDateStr) {
  if (!endDateStr) return null;
  const end = new Date(endDateStr).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeTime(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const PLAN_STYLES = {
  trial: 'bg-slate-100 text-slate-700',
  pro: 'bg-violet-100 text-violet-700',
  enterprise: 'bg-teal-100 text-teal-700',
};

const STATUS_CONFIG = {
  active: { dot: 'bg-green-500', label: 'Active' },
  trialing: { dot: 'bg-blue-500', label: 'Trialing' },
  past_due: { dot: 'bg-amber-500', label: 'Past Due' },
  canceled: { dot: 'bg-red-500', label: 'Canceled' },
};

// ── Stat Card ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Countdown Pill ───────────────────────────────────────────────────

function CountdownPill({ daysLeft }) {
  if (daysLeft === null) return <span className="text-xs text-slate-400">No end date</span>;
  if (daysLeft < 0) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Expired</span>;
  }
  let color = 'bg-green-100 text-green-700';
  if (daysLeft <= 14) color = 'bg-amber-100 text-amber-700';
  if (daysLeft <= 0) color = 'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{daysLeft} days left</span>;
}

// ── Main Component ───────────────────────────────────────────────────

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [grantUser, setGrantUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getAdminUsers', {});
      setUsers(res.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({ title: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.subscription_status === 'active' && u.stripe_subscription_id).length,
    trialing: users.filter(u => u.subscription_status === 'trialing').length,
    pastDue: users.filter(u => u.subscription_status === 'past_due').length,
  };

  const handleGrant = async (user, duration) => {
    const endDate = duration.unit === 'lifetime'
      ? null
      : new Date(Date.now() + duration.value * 86400000).toISOString();

    try {
      await base44.functions.invoke('adminFixUserSubscription', {
        userId: user.id,
        plan: 'pro',
        status: 'active',
        billing: duration.unit === 'lifetime' ? 'yearly' : (duration.value <= 30 ? 'monthly' : 'yearly'),
        subscription_end_date: endDate,
      });
      toast({ title: 'Access granted', description: `${user.full_name || user.email} now has Pro access` });
      setGrantUser(null);
      await fetchUsers();
    } catch (error) {
      toast({ title: 'Failed to grant access', description: error.message, variant: 'destructive' });
    }
  };

  const handleAction = async (action, user) => {
    setActionLoading(user.id + action);
    try {
      if (action === 'delete') {
        if (!window.confirm(`Delete ${user.email}? This cannot be undone.`)) return;
        await base44.asServiceRole.entities.User.delete(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast({ title: 'User deleted' });
      } else if (action === 'reset') {
        await base44.functions.invoke('adminFixUserSubscription', {
          userId: user.id, plan: 'trial', status: 'trialing', billing: null, subscription_end_date: null,
        });
        toast({ title: 'Reset to trial' });
        await fetchUsers();
      } else if (action === 'revoke') {
        await base44.functions.invoke('adminFixUserSubscription', {
          userId: user.id, plan: 'trial', status: 'canceled', billing: null, subscription_end_date: null,
        });
        toast({ title: 'Access revoked' });
        await fetchUsers();
      }
    } catch (error) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} total users</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats.total} color="#007850" />
        <StatCard icon={UserCheck} label="Active Subscribers" value={stats.active} color="#00B478" />
        <StatCard icon={Clock} label="Trialing" value={stats.trialing} color="#00A8C8" />
        <StatCard icon={AlertTriangle} label="Past Due" value={stats.pastDue} color="#D4900A" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Inbox className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">{search ? 'No users match your search.' : 'No users found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left font-semibold text-slate-600 sticky left-0 bg-slate-50 z-10">User</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Plan</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Billing</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Renews / Expires</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Last Active</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(user => {
                  const daysLeft = getDaysLeft(user.subscription_end_date);
                  const status = STATUS_CONFIG[user.subscription_status] || STATUS_CONFIG.trialing;
                  const isLoading = actionLoading === user.id + 'delete' || actionLoading === user.id + 'reset' || actionLoading === user.id + 'revoke';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      {/* User cell — sticky on mobile scroll */}
                      <td className="px-5 py-3 sticky left-0 bg-white z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
                            {user.profile_image_url
                              ? <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
                              : (user.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate flex items-center gap-1">
                              {user.full_name || user.display_name || 'Unknown'}
                              {user.role === 'admin' && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PLAN_STYLES[user.subscription_plan] || PLAN_STYLES.trial}`}>
                          {(user.subscription_plan || 'trial').charAt(0).toUpperCase() + (user.subscription_plan || 'trial').slice(1)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                          <span className="text-slate-700">{status.label}</span>
                        </div>
                      </td>

                      {/* Billing */}
                      <td className="px-5 py-3">
                        {user.subscription_billing ? (
                          <span className="text-xs text-slate-600 capitalize">{user.subscription_billing}</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Renews/Expires */}
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(user.subscription_end_date)}
                          </span>
                          <CountdownPill daysLeft={daysLeft} />
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="px-5 py-3">
                        <span className="text-xs text-slate-500">{relativeTime(user.last_active_date)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGrantUser(user)}
                            className="h-8 text-xs border-violet-200 text-violet-700 hover:bg-violet-50"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Grant Access
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAction('reset', user)}>
                                <RotateCcw className="w-4 h-4 mr-2" /> Reset to Trial
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('revoke', user)}>
                                <Ban className="w-4 h-4 mr-2" /> Revoke Access
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction('delete', user)} className="text-red-600 focus:text-red-700">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Access Modal */}
      {grantUser && (
        <GrantAccessModal
          user={grantUser}
          onConfirm={handleGrant}
          onClose={() => setGrantUser(null)}
        />
      )}
    </div>
  );
}