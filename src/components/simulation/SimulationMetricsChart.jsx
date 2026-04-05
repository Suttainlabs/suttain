import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SimulationMetricsChart({ jobs, selectedJobId, onJobSelect }) {
  const [metricType, setMetricType] = useState('energy');
  const [showArea, setShowArea] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  
  // Generate mock time-series data from optimization steps if available
  const getChartData = () => {
    if (!selectedJob || !selectedJob.optimizationSteps || selectedJob.optimizationSteps.length === 0) {
      return [];
    }

    return selectedJob.optimizationSteps.map((step, idx) => ({
      time: `Step ${step.step}`,
      energy: parseFloat(step.energy) || null,
      rmsd: parseFloat(step.rmsd) || null,
      maxForce: parseFloat(step.maxForce) || null,
      temperature: 300 + Math.random() * 20,
      pressure: 1.0 + Math.random() * 0.1,
    }));
  };

  const data = getChartData();

  const getMetricConfig = () => {
    const configs = {
      energy: {
        label: 'Energy (kcal/mol)',
        dataKey: 'energy',
        stroke: '#f59e0b',
        fill: '#f59e0b',
      },
      rmsd: {
        label: 'RMSD (Å)',
        dataKey: 'rmsd',
        stroke: '#10b981',
        fill: '#10b981',
      },
      force: {
        label: 'Max Force (kcal/mol/Å)',
        dataKey: 'maxForce',
        stroke: '#ef4444',
        fill: '#ef4444',
      },
      temperature: {
        label: 'Temperature (K)',
        dataKey: 'temperature',
        stroke: '#06b6d4',
        fill: '#06b6d4',
      },
    };
    return configs[metricType] || configs.energy;
  };

  const metric = getMetricConfig();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Simulation Metrics</h3>
        </div>
        {selectedJob && (
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">
            {selectedJob.name}
          </span>
        )}
      </div>

      {/* Job Selector */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-600 block mb-2">Select Job:</label>
        <div className="flex gap-2 flex-wrap">
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => onJobSelect(job.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedJobId === job.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {job.name.substring(0, 20)}…
            </button>
          ))}
        </div>
      </div>

      {/* Metric Type Selector */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs font-semibold text-slate-600">Metric:</span>
        {['energy', 'rmsd', 'force', 'temperature'].map(type => (
          <button
            key={type}
            onClick={() => setMetricType(type)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              metricType === type
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type === 'energy' && 'Energy'}
            {type === 'rmsd' && 'RMSD'}
            {type === 'force' && 'Max Force'}
            {type === 'temperature' && 'Temperature'}
          </button>
        ))}
        <Button
          onClick={() => setShowArea(!showArea)}
          size="sm"
          variant={showArea ? 'default' : 'outline'}
          className="text-xs ml-auto"
        >
          {showArea ? 'Line' : 'Area'} View
        </Button>
      </div>

      {/* Chart */}
      {!selectedJob ? (
        <div className="h-80 flex flex-col items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-600 font-semibold">Select a job to view metrics</p>
          <p className="text-xs text-slate-500 mt-1">Data from active simulations will appear here</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Zap className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-600 font-semibold">No data available</p>
          <p className="text-xs text-slate-500 mt-1">Metrics will populate as the simulation runs</p>
        </div>
      ) : showArea ? (
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.fill} stopOpacity={0.8} />
                <stop offset="95%" stopColor={metric.fill} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => value ? value.toFixed(4) : 'N/A'}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={metric.dataKey}
              name={metric.label}
              stroke={metric.stroke}
              fillOpacity={1}
              fill="url(#colorMetric)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => value ? value.toFixed(4) : 'N/A'}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={metric.dataKey}
              name={metric.label}
              stroke={metric.stroke}
              dot={false}
              strokeWidth={2.5}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Stats Footer */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Current</p>
            <p className="text-sm font-bold text-slate-900">
              {data[data.length - 1][metric.dataKey]?.toFixed(4) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Min</p>
            <p className="text-sm font-bold text-slate-900">
              {Math.min(...data.map(d => d[metric.dataKey] || Infinity)).toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Max</p>
            <p className="text-sm font-bold text-slate-900">
              {Math.max(...data.map(d => d[metric.dataKey] || -Infinity)).toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Steps</p>
            <p className="text-sm font-bold text-slate-900">{data.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}