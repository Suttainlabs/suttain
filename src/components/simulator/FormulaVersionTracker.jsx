import React, { useState, useEffect } from 'react';
import { History, RotateCcw, Save, ChevronDown, ChevronUp, Clock, FlaskConical, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VERSION_STORAGE_KEY = 'suttain_formula_versions';

function loadVersions() {
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVersions(versions) {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions.slice(0, 20)));
  } catch {}
}

export function saveFormulaVersion(chemicals, simulationData, label) {
  const versions = loadVersions();
  const newVersion = {
    id: Date.now(),
    label: label || `Version ${versions.length + 1}`,
    timestamp: new Date().toISOString(),
    chemicals: chemicals.map(c => ({
      id: c.id,
      name: c.name,
      scientific_name: c.scientific_name,
      concentration: c.concentration,
      concentrationUnit: c.concentrationUnit,
      purity: c.purity,
    })),
    metrics: {
      environmental_impact: simulationData?.risk_assessment?.environmental_impact_score ?? null,
      health_impact: simulationData?.risk_assessment?.health_impact_score ?? null,
      overall_risk: simulationData?.risk_assessment?.overall_risk_score ?? null,
      safety_level: simulationData?.safety_status?.level ?? null,
    },
  };
  const updated = [newVersion, ...versions];
  saveVersions(updated);
  return newVersion;
}

export default function FormulaVersionTracker({ chemicals, simulationData, onRevert }) {
  const [versions, setVersions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [revertedId, setRevertedId] = useState(null);

  useEffect(() => {
    setVersions(loadVersions());
  }, []);

  const handleSave = () => {
    const v = saveFormulaVersion(chemicals, simulationData, `Run ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setVersions(prev => [v, ...prev].slice(0, 20));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRevert = (version) => {
    setRevertedId(version.id);
    onRevert(version.chemicals);
    setTimeout(() => setRevertedId(null), 2000);
  };

  const handleDelete = (id) => {
    const updated = versions.filter(v => v.id !== id);
    setVersions(updated);
    saveVersions(updated);
  };

  const safeLevelColor = (level) => {
    const map = { SAFE: 'text-green-600 bg-green-50', LOW: 'text-teal-600 bg-teal-50', MODERATE: 'text-amber-600 bg-amber-50', DANGEROUS: 'text-orange-600 bg-orange-50', CRITICAL: 'text-red-600 bg-red-50', FATAL: 'text-red-800 bg-red-100' };
    return map[level] || 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-slate-800 text-sm">Formula Version History</span>
          {versions.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{versions.length}</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4">
          {/* Save current */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Save the current ingredient list as a version you can revert to later.</p>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={chemicals.length === 0}
              className={`flex items-center gap-1.5 text-xs ${saved ? 'bg-green-600 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
            >
              {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> Save Version</>}
            </Button>
          </div>

          {/* Version list */}
          {versions.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <History className="w-7 h-7 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No versions saved yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {versions.map((v) => (
                <div key={v.id} className={`rounded-xl border p-3.5 transition-colors ${revertedId === v.id ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{v.label}</span>
                        {v.metrics.safety_level && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${safeLevelColor(v.metrics.safety_level)}`}>
                            {v.metrics.safety_level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                        <Clock className="w-3 h-3" />
                        {new Date(v.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {v.chemicals.slice(0, 4).map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">
                            <FlaskConical className="w-2.5 h-2.5 text-teal-500" />
                            {c.name || c.scientific_name}
                          </span>
                        ))}
                        {v.chemicals.length > 4 && <span className="text-[10px] text-slate-400">+{v.chemicals.length - 4} more</span>}
                      </div>
                      {v.metrics.environmental_impact != null && (
                        <div className="flex gap-3 mt-2 text-[10px] text-slate-500">
                          <span>Env Impact: <strong className="text-slate-700">{v.metrics.environmental_impact}</strong></span>
                          <span>Risk: <strong className="text-slate-700">{v.metrics.overall_risk}</strong></span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRevert(v)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 hover:border-indigo-400 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Revert
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 bg-white border border-red-100 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}