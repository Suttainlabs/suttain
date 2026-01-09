import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, Info } from 'lucide-react';

export default function SurfacePlot3D({ conditions }) {
    if (!conditions || conditions.length < 2) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-lg text-center p-8 border-2 border-dashed border-slate-200">
                <BarChart3 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h4 className="font-semibold text-slate-600 mb-2">Chart Visualization Unavailable</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                    Define at least 2 experimental conditions to generate comparative charts and analysis.
                </p>
            </div>
        );
    }

    // Prepare data for charts
    const chartData = conditions.map((condition, index) => ({
        name: condition.name || `Condition ${index + 1}`,
        temperature: condition.temperature || 25,
        pressure: condition.pressure || 1,
        time: condition.time || 10,
        yield: condition.yield || 0,
        selectivity: condition.selectivity || 0,
        power: condition.power || 0
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            <span className="font-medium">{entry.name}:</span> {entry.value}
                            {entry.dataKey === 'yield' || entry.dataKey === 'selectivity' ? '%' : 
                             entry.dataKey === 'temperature' ? '°C' :
                             entry.dataKey === 'pressure' ? ' atm' :
                             entry.dataKey === 'time' ? ' min' :
                             entry.dataKey === 'power' ? 'W' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Performance Metrics Chart */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    <h4 className="font-semibold text-slate-800">Reaction Performance Analysis</h4>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="line"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="yield" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                                name="Yield (%)"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="selectivity" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                name="Selectivity (%)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Experimental Conditions Chart */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Experimental Conditions Comparison</h4>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis 
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="rect"
                            />
                            <Bar 
                                dataKey="temperature" 
                                fill="#f59e0b" 
                                name="Temperature (°C)"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar 
                                dataKey="pressure" 
                                fill="#8b5cf6" 
                                name="Pressure (atm)"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar 
                                dataKey="time" 
                                fill="#06b6d4" 
                                name="Time (min)"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-lg border border-teal-200">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-teal-800 mb-3">Key Analysis Insights</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white/60 p-3 rounded-lg">
                                <h5 className="font-medium text-teal-700 mb-1">Best Performing Condition</h5>
                                <p className="text-teal-600">
                                    {(() => {
                                        const best = chartData.reduce((prev, current) => 
                                            (current.yield > prev.yield) ? current : prev
                                        );
                                        return `${best.name} with ${best.yield}% yield`;
                                    })()}
                                </p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-lg">
                                <h5 className="font-medium text-blue-700 mb-1">Highest Selectivity</h5>
                                <p className="text-blue-600">
                                    {(() => {
                                        const best = chartData.reduce((prev, current) => 
                                            (current.selectivity > prev.selectivity) ? current : prev
                                        );
                                        return `${best.name} with ${best.selectivity}% selectivity`;
                                    })()}
                                </p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-lg">
                                <h5 className="font-medium text-amber-700 mb-1">Temperature Range</h5>
                                <p className="text-amber-600">
                                    {Math.min(...chartData.map(d => d.temperature))}°C - {Math.max(...chartData.map(d => d.temperature))}°C
                                </p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-lg">
                                <h5 className="font-medium text-purple-700 mb-1">Pressure Range</h5>
                                <p className="text-purple-600">
                                    {Math.min(...chartData.map(d => d.pressure))} - {Math.max(...chartData.map(d => d.pressure))} atm
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}