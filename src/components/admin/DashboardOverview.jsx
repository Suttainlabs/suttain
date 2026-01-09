
import React, { useState, useEffect } from 'react';
import { Users, Beaker, TestTube, Star, List, FileText, Loader2, Download } from 'lucide-react';
import { getAdminStats } from '@/functions/getAdminStats';
import { exportAdminData } from '@/functions/exportAdminData';
import OverviewChart from './charts/OverviewChart';
import { Button } from '@/components/ui/button';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {loading ? (
        <div className="h-8 w-12 bg-slate-200 animate-pulse rounded-md mt-1"></div>
      ) : (
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      )}
    </div>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </div>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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
        // Assuming the `exportAdminData` function returns a response object
        // where `response.data` contains the raw CSV string or Blob.
        // If it's a string, we need to ensure it's treated as a Blob.
        const blobData = typeof response.data === 'string' ? new TextEncoder().encode(response.data) : response.data;
        
        const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        const filename = `suttain_platform_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('download', filename);
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

  const statCards = [
    { title: 'Total Users', value: stats?.totals?.user, icon: Users, color: 'bg-blue-500' },
    { title: 'Formulas Created', value: stats?.totals?.formula, icon: Beaker, color: 'bg-teal-500' },
    { title: 'Simulations Run', value: stats?.totals?.simulation, icon: TestTube, color: 'bg-violet-500' },
    { title: 'Reviews Submitted', value: stats?.totals?.review, icon: Star, color: 'bg-amber-500' },
    { title: 'Enterprise Waitlist', value: stats?.totals?.enterprise_waitlist, icon: List, color: 'bg-purple-500' },
    { title: 'Demo Requests', value: stats?.totals?.demo_request, icon: FileText, color: 'bg-sky-500' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : 'Download Report'}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} value={card.value || 0} />
        ))}
      </div>
       <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Platform Activity (Last 30 Days)</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm" style={{ height: '400px' }}>
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading Chart Data...</span>
                    </div>
                ) : (
                    <OverviewChart data={stats?.activityData || []} />
                )}
            </div>
        </div>
    </div>
  );
}
