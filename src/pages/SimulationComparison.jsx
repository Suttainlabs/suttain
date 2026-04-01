import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import useTrialStatus from '../hooks/useTrialStatus';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, Check, AlertTriangle, Loader2, BarChart3 } from 'lucide-react';

const getDiffColor = (val1, val2) => {
  if (val1 === val2) return 'bg-slate-50';
  return val1 > val2 ? 'bg-red-50' : 'bg-green-50';
};

const ComparisonTable = ({ selected, simulations }) => {
  const allMetrics = [
    { key: 'chemicals', label: 'Chemicals', type: 'text' },
    { key: 'risk_score', label: 'Risk Score', type: 'number' },
    { key: 'health_impact', label: 'Health Impact', type: 'number' },
    { key: 'environmental_impact', label: 'Env Impact', type: 'number' },
    { key: 'voc_level', label: 'VOC Level', type: 'number' },
    { key: 'reactivity', label: 'Reactivity', type: 'number' },
    { key: 'hazard_symbols', label: 'Hazard Symbols', type: 'array' },
    { key: 'created_date', label: 'Created', type: 'date' }
  ];

  const selectedSims = simulations.filter(s => selected.includes(s.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-300 bg-slate-50">
            <th className="text-left px-4 py-3 font-bold text-slate-700 w-32">Metric</th>
            {selectedSims.map(sim => (
              <th
                key={sim.id}
                className="px-4 py-3 font-semibold text-slate-700 bg-slate-100 border-l border-slate-200 min-w-40"
              >
                <div className="truncate">{sim.name || 'Simulation'}</div>
                <div className="text-xs text-slate-500 font-normal mt-1">
                  {new Date(sim.created_date).toLocaleDateString()}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allMetrics.map((metric, idx) => {
            const values = selectedSims.map(sim => sim[metric.key]);
            const allSame = values.every(v => v === values[0]);

            return (
              <tr key={metric.key} className="border-b border-slate-200">
                <td className="px-4 py-3 font-semibold text-slate-800 bg-slate-50">{metric.label}</td>
                {selectedSims.map((sim, colIdx) => {
                  const val = sim[metric.key];
                  const bgColor =
                    metric.type === 'text' || metric.type === 'array'
                      ? 'bg-white'
                      : allSame
                      ? 'bg-white'
                      : getDiffColor(val, values[0]);

                  return (
                    <td
                      key={`${sim.id}-${metric.key}`}
                      className={`px-4 py-3 border-l border-slate-200 ${bgColor}`}
                    >
                      {metric.type === 'number' && val !== undefined ? (
                        <span className={`font-semibold ${val > 70 ? 'text-red-600' : val > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                          {val}
                        </span>
                      ) : metric.type === 'array' && val ? (
                        <div className="flex flex-wrap gap-1">
                          {val.map(v => (
                            <Badge key={v} variant="outline" className="text-xs capitalize">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      ) : metric.type === 'date' ? (
                        <span className="text-slate-600 text-xs">{new Date(val).toLocaleDateString()}</span>
                      ) : metric.type === 'text' && val ? (
                        <span className="text-slate-700">{Array.isArray(val) ? val.join(', ') : val}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const SimulationSelector = ({ simulations, selected, onToggle, isLoading }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">Select Simulations to Compare</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
          <p className="text-slate-500">Loading simulations...</p>
        </div>
      ) : simulations.length === 0 ? (
        <div className="p-6 bg-slate-50 rounded-lg text-center">
          <p className="text-slate-600">No simulations found. Run a simulation first.</p>
          <Link to={createPageUrl('Simulator')} className="text-violet-600 hover:underline text-sm mt-2 inline-block">
            Go to Chemical Simulator
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {simulations.map(sim => (
            <button
              key={sim.id}
              onClick={() => onToggle(sim.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selected.includes(sim.id)
                  ? 'border-violet-500 bg-violet-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-violet-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {sim.name || 'Simulation'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {sim.chemicals?.join(', ') || 'N/A'}
                  </p>
                  {sim.risk_score !== undefined && (
                    <p className={`text-xs font-bold mt-2 ${sim.risk_score > 70 ? 'text-red-600' : sim.risk_score > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                      Risk: {sim.risk_score}
                    </p>
                  )}
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  selected.includes(sim.id)
                    ? 'bg-violet-500 border-violet-500'
                    : 'border-slate-300'
                }`}>
                  {selected.includes(sim.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">Select 2 or more to compare</p>
    </div>
  );
};

export default function SimulationComparison() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const [simulations, setSimulations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const sims = await base44.entities.Simulation.list('-created_date', 100);
        setSimulations(sims);
      } catch (err) {
        console.error('Error fetching simulations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSimulations();
  }, []);

  const handleToggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const canAccess = !user || trialStatus.isPro || trialStatus.trialDaysLeft > 0;

  if (user && !canAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-violet-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pro Feature</h2>
          <p className="text-slate-600 mb-6">Simulation comparison requires a Pro subscription.</p>
          <Link to={createPageUrl('Pricing')} className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGate featureName="Simulation Comparison" featureDescription="Compare multiple simulation results side-by-side.">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <BarChart3 className="w-4 h-4" /> Comparison Tool
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Simulation Comparison
          </h1>
          <p className="text-slate-600 max-w-2xl text-base">
            Select multiple simulations to analyze risk scores, impacts, and chemical profiles side-by-side. Highlight differences to make informed decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Selector Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24">
              <CardContent className="p-5">
                <SimulationSelector
                  simulations={simulations}
                  selected={selected}
                  onToggle={handleToggle}
                  isLoading={isLoading}
                />
                {selected.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setSelected([])}
                      className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Comparison Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            {selected.length < 2 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Select 2 or more simulations to compare</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Comparing {selected.length} Simulations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ComparisonTable
                    selected={selected}
                    simulations={simulations}
                  />
                </CardContent>
              </Card>
            )}

            {/* Info Panel */}
            {selected.length >= 2 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold">Comparison Tips:</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>Cells highlighted in red indicate higher values, green indicate lower values</li>
                    <li>Compare risk scores to identify safer chemical combinations</li>
                    <li>Review hazard symbols to understand reaction types</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AuthGate>
  );
}