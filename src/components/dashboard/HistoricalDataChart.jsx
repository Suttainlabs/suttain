import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const getMonthlyData = (formulas, simulations, scans) => {
  const months = {};
  const now = new Date();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months[key] = { month: key, formulas: 0, simulations: 0, scans: 0 };
  }

  // Count formulas
  formulas.forEach(item => {
    const date = new Date(item.created_date);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (months[key]) months[key].formulas++;
  });

  // Count simulations
  simulations.forEach(item => {
    const date = new Date(item.created_date);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (months[key]) months[key].simulations++;
  });

  // Count scans
  scans.forEach(item => {
    const date = new Date(item.created_date);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (months[key]) months[key].scans++;
  });

  return Object.values(months);
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-800 mb-2">{payload[0].payload.month}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function HistoricalDataChart({ formulas = [], simulations = [], scans = [], isLoading }) {
  const data = getMonthlyData(formulas, simulations, scans);
  const totalActivity = formulas.length + simulations.length + scans.length;
  
  // Calculate trend
  const firstHalf = data.slice(0, 3).reduce((sum, m) => sum + m.formulas + m.simulations + m.scans, 0);
  const secondHalf = data.slice(3, 6).reduce((sum, m) => sum + m.formulas + m.simulations + m.scans, 0);
  const trend = secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'stable';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Activity History
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending Up
              </Badge>
            )}
            <Badge variant="outline" className="font-normal">
              <Calendar className="w-3 h-3 mr-1" />
              Last 6 months
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-center gap-8">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : totalActivity > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="formulas" name="Formulas" fill="#9531F5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="simulations" name="Simulations" fill="#02988C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="scans" name="Scans" fill="#09D2FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No historical data yet</p>
            <p className="text-xs text-slate-400 mt-1">Start using Suttain to see your activity trends</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}