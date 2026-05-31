import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Crown, TrendingUp, Activity, Star, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#007850', '#00A8C8', '#6B3FA0', '#f59e0b', '#64748b'];

export default function UserAnalytics() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await base44.entities.User.list('-created_date', 1000);
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
  }, []);

  // Signups per month (last 6 months)
  const signupsByMonth = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push({ month: key, year: d.getFullYear(), monthNum: d.getMonth(), count: 0 });
    }
    users.forEach(u => {
      if (!u.created_date) return;
      const d = new Date(u.created_date);
      const entry = months.find(m => m.year === d.getFullYear() && m.monthNum === d.getMonth());
      if (entry) entry.count++;
    });
    return months.map(({ month, count }) => ({ month, count }));
  })();

  // Plan distribution
  const planCounts = users.reduce((acc, u) => {
    const plan = u.subscription_plan || u.data?.subscription_plan || 'free';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});
  const planData = Object.entries(planCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Key metrics
  const totalUsers = users.length;
  const proUsers = users.filter(u => {
    const p = u.subscription_plan || u.data?.subscription_plan;
    return p === 'pro' || p === 'lifetime' || p === 'enterprise';
  }).length;
  const activeThisMonth = users.filter(u => {
    if (!u.last_active_date) return false;
    const d = new Date(u.last_active_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const avgRewardPoints = totalUsers > 0
    ? Math.round(users.reduce((sum, u) => sum + (u.reward_points || 0), 0) / totalUsers)
    : 0;
  const conversionRate = totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : '0';

  // Top users by reward points
  const topUsers = [...users]
    .sort((a, b) => (b.reward_points || 0) - (a.reward_points || 0))
    .slice(0, 5);

  // New signups this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = users.filter(u => u.created_date && new Date(u.created_date) >= oneWeekAgo).length;

  const statCards = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-slate-800 text-white', bg: 'from-slate-50 to-slate-100' },
    { label: 'Pro Subscribers', value: proUsers, icon: Crown, color: 'bg-teal-600 text-white', bg: 'from-teal-50 to-cyan-50' },
    { label: 'Active This Month', value: activeThisMonth, icon: Activity, color: 'bg-violet-600 text-white', bg: 'from-violet-50 to-purple-50' },
    { label: 'New This Week', value: newThisWeek, icon: TrendingUp, color: 'bg-blue-600 text-white', bg: 'from-blue-50 to-cyan-50' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: UserCheck, color: 'bg-amber-500 text-white', bg: 'from-amber-50 to-orange-50' },
    { label: 'Avg Reward Points', value: avgRewardPoints, icon: Star, color: 'bg-yellow-500 text-white', bg: 'from-yellow-50 to-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Analytics</h2>
          {lastRefreshed && (
            <p className="text-xs text-slate-400 mt-0.5">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={`border-0 shadow-sm bg-gradient-to-br ${card.bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{loading ? '...' : card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Over Time */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">New Signups (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={signupsByMonth} barSize={28}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#007850" radius={[4, 4, 0, 0]} name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {planData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users by Engagement */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Top Users by Reward Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-slate-400 py-4 text-center">Loading...</p>
            ) : topUsers.map((u, i) => {
              const plan = u.subscription_plan || u.data?.subscription_plan || 'free';
              const isPro = plan === 'pro' || plan === 'lifetime' || plan === 'enterprise';
              return (
                <div key={u.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-bold text-slate-400 w-5">{i + 1}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isPro ? 'bg-teal-600' : 'bg-slate-400'}`}>
                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.full_name || u.email}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  {isPro && <Badge className="bg-teal-100 text-teal-700 text-xs border-0">Pro</Badge>}
                  <div className="flex items-center gap-1 text-yellow-600 font-semibold text-sm">
                    <Star className="w-3.5 h-3.5" />
                    {u.reward_points || 0}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}