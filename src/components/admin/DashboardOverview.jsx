import React, { useState, useEffect } from 'react';
import { Users, Beaker, TestTube, Star, List, FileText, Loader2, Download, QrCode, ShieldCheck, HeartPulse, TrendingUp, ArrowUpRight, ArrowDownRight, Minus, CreditCard, Cpu, FlaskConical, BarChart2, Leaf, Sparkles, Atom, Shield } from 'lucide-react';
import { getAdminStats } from '@/functions/getAdminStats';
import { exportAdminData } from '@/functions/exportAdminData';
import { exportSubscriptionReport } from '@/functions/exportSubscriptionReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminActivityChart from './charts/AdminActivityChart';
import VisitorGeoChart from './VisitorGeoChart';
import AdminAnalyticsCards from './AdminAnalyticsCards';
import RealTimeTrafficPanel from './RealTimeTrafficPanel';

const StatCard = ({ title, value, icon: Icon, color, bgColor, weekCount, loading }) => {
  const trend = weekCount > 0 ? 'up' : weekCount === 0 ? 'flat' : 'flat';
  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            {loading ? (
              <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-md" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">{(value || 0).toLocaleString()}</p>
            )}
            {!loading && weekCount !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {weekCount} this week
                </span>
              </div>
            )}
          </div>
          <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSubscriptions, setIsExportingSubscriptions] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportAdminData();
      const blobData = typeof response.data === 'string' ? new TextEncoder().encode(response.data) : response.data;
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `suttain_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSubscriptions = async () => {
    setIsExportingSubscriptions(true);
    try {
      const response = await exportSubscriptionReport();
      const blobData = typeof response.data === 'string' ? new TextEncoder().encode(response.data) : response.data;
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `suttain_subscription_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export subscription report:", error);
    } finally {
      setIsExportingSubscriptions(false);
    }
  };

  const growth = stats?.weeklyGrowth || {};

  const primaryStats = [
    { title: 'Total Users', value: stats?.totals?.user, weekCount: growth.weekUsers, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Pro Subscribers', value: stats?.totals?.subscribers, weekCount: growth.weekSubscribers, icon: CreditCard, color: 'text-violet-600', bgColor: 'bg-violet-50' },
    { title: 'Formulas Created', value: stats?.totals?.formula, weekCount: growth.weekFormulas, icon: Beaker, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Simulations Run', value: stats?.totals?.simulation, weekCount: growth.weekSimulations, icon: TestTube, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Products Scanned', value: stats?.totals?.barcode_scan, weekCount: growth.weekScans, icon: QrCode, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  ];

  const toolsOverview = [
    { label: 'Chemical Simulator', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Safety, hazard & risk analysis' },
    { label: 'Formula Generator', icon: Atom, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'AI-powered formulation builder' },
    { label: 'Quick Scan', icon: QrCode, color: 'text-cyan-600', bg: 'bg-cyan-50', desc: 'Barcode & ingredient scanner' },
    { label: 'Ingredient Database', icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50', desc: '250k+ chemicals with eco data' },
    { label: 'Compliance Co-Pilot', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50', desc: '50+ regulatory regions' },
    { label: 'Sustainability Scoring', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', desc: 'Eco & carbon footprint scoring' },
    { label: 'Computational Sims', icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'DFT, MD, protein modeling' },
    { label: 'Impact Reports', icon: BarChart2, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Analytics & comparative reports' },
  ];

  const secondaryStats = [
    { title: 'Reviews', value: stats?.totals?.review, icon: Star, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { title: 'Compliance Checks', value: stats?.totals?.compliance_check, icon: ShieldCheck, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { title: 'Safety Profiles', value: stats?.totals?.safety_profile, icon: HeartPulse, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { title: 'Demo Requests', value: stats?.totals?.demo_request, icon: FileText, color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { title: 'Waitlist', value: stats?.totals?.enterprise_waitlist, icon: List, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Contact Messages', value: stats?.totals?.contact_submission, icon: FileText, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportSubscriptions} disabled={isExportingSubscriptions} variant="outline" size="sm" className="border-violet-200 text-violet-700 hover:bg-violet-50">
            {isExportingSubscriptions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
            {isExportingSubscriptions ? 'Exporting...' : 'Subscription Report'}
          </Button>
          <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm">
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {primaryStats.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Tools Overview */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Platform Tools ({toolsOverview.length} Active)</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {toolsOverview.map((tool) => (
            <div key={tool.label} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:shadow-sm transition-shadow">
              <div className={`w-9 h-9 rounded-lg ${tool.bg} flex items-center justify-center`}>
                <tool.icon className={`w-4 h-4 ${tool.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{tool.label}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5 hidden sm:block">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">Platform Activity (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '320px' }}>
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              <AdminActivityChart data={stats?.activityData || []} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Traffic */}
      <RealTimeTrafficPanel />

      {/* Visitor Geo Analytics */}
      <VisitorGeoChart />

      {/* Analytics Row */}
      {!loading && stats && <AdminAnalyticsCards stats={stats} />}

      {/* Secondary Stats */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Other Metrics</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {secondaryStats.map((card) => (
            <Card key={card.title} className="border border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{card.title}</p>
                    {loading ? (
                      <div className="h-5 w-8 bg-slate-100 animate-pulse rounded mt-0.5" />
                    ) : (
                      <p className="text-lg font-bold text-slate-900">{(card.value || 0).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}