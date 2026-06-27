import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, ChevronRight, Zap, Users, TrendingUp, Activity, AlertCircle, BarChart3, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdminKPIOverview from './AdminKPIOverview';
import AdminAnalyticsChart from './AdminAnalyticsChart';
import AdminUserManagement from './AdminUserManagement';
import AdminSystemLogs from './AdminSystemLogs';
import AdminCommandMenu from './AdminCommandMenu';

export default function AdminCommandCenter() {
  const [dateRange, setDateRange] = useState('7d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandMenu(!showCommandMenu);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandMenu]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const adminStats = await base44.functions.invoke('getAdminStats', { dateRange });
        setStats(adminStats);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateRange]);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-gilroy overflow-hidden">
      {/* Command Menu Trigger */}
      {showCommandMenu && <AdminCommandMenu onClose={() => setShowCommandMenu(false)} />}

      {/* Header */}
      <div className="border-b border-slate-800 bg-[#0F1419]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-slate-400">Admin Command Center</span>
          </div>
          <button
            onClick={() => setShowCommandMenu(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 transition-colors text-xs text-slate-400"
          >
            <Command className="w-3 h-3" />
            <span>Cmd+K</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* KPI Overview */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Activity className="w-6 h-6 text-slate-600 animate-pulse" />
          </div>
        ) : (
          <>
            <AdminKPIOverview stats={stats} />

            {/* Analytics Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-[#0F1419] border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-500" />
                      Platform Activity
                    </h2>
                    <div className="flex gap-2">
                      {['24h', '7d', '30d'].map(range => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            dateRange === range
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <AdminAnalyticsChart stats={stats} dateRange={dateRange} />
                </div>
              </div>

              {/* Quick Stats Sidebar */}
              <div className="space-y-4">
                {[
                  { label: 'API Calls', value: stats?.apiCalls || '0', color: 'from-cyan-600 to-blue-600' },
                  { label: 'System Health', value: stats?.systemHealth || '98%', color: 'from-emerald-600 to-teal-600' },
                  { label: 'Avg Response Time', value: stats?.avgResponseTime || '45ms', color: 'from-violet-600 to-purple-600' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#0F1419] border border-slate-800 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-100">{item.value}</p>
                    <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${item.color}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 border-b border-slate-800 flex gap-8">
              {[
                { id: 'overview', label: 'Users & Submissions', icon: Users },
                { id: 'logs', label: 'System Logs', icon: AlertCircle },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="mt-8">
              {activeTab === 'overview' && <AdminUserManagement />}
              {activeTab === 'logs' && <AdminSystemLogs />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}