import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, RefreshCw, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getDaysRemaining(endDateStr) {
  if (!endDateStr) return null;
  const diff = new Date(endDateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SubscribedUsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSubscribedUsers = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.User.list('-created_date', 500);
      const subscribed = all.filter(u => {
        const status = u.subscription_status || u.data?.subscription_status;
        return status === 'active';
      });
      setUsers(subscribed);
    } catch (err) {
      console.error('Failed to fetch subscribed users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedUsers();
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
  });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Plan', 'Billing', 'End Date', 'Days Remaining'];
    const rows = filtered.map(u => [
      u.full_name || '',
      u.email || '',
      u.subscription_plan || u.data?.subscription_plan || '',
      u.subscription_billing || u.data?.subscription_billing || '',
      u.subscription_end_date || u.data?.subscription_end_date || '',
      getDaysRemaining(u.subscription_end_date || u.data?.subscription_end_date) ?? '—'
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribed_users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Subscribed Users
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {users.length} active subscriber{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={loading || users.length === 0}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSubscribedUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Crown className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>No subscribed users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Plan</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Billing</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">End / Renewal Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const plan = u.subscription_plan || u.data?.subscription_plan || '—';
                    const billing = u.subscription_billing || u.data?.subscription_billing || '—';
                    const endDate = u.subscription_end_date || u.data?.subscription_end_date;
                    const cancelAt = u.subscription_cancel_at || u.data?.subscription_cancel_at;
                    const daysLeft = getDaysRemaining(endDate);
                    const isLifetime = plan === 'lifetime' || (u.admin_access_duration_label || u.data?.admin_access_duration_label) === 'Lifetime';

                    return (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{u.full_name || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="capitalize">{plan}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600 capitalize">{billing}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {cancelAt ? (
                            <span className="text-amber-600">Cancels: {formatDate(cancelAt)}</span>
                          ) : isLifetime ? (
                            <span className="text-teal-600 font-medium">Lifetime</span>
                          ) : (
                            formatDate(endDate)
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isLifetime ? (
                            <Badge className="bg-teal-100 text-teal-700">Lifetime</Badge>
                          ) : daysLeft !== null ? (
                            <Badge className={daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}>
                              {daysLeft} days
                            </Badge>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}