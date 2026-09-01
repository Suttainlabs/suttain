import React, { useState } from 'react';
import { Loader2, Database, ExternalLink, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

const SOURCE_ORDER = [
  { key: 'pubchemGHS', label: 'PubChem GHS' },
  { key: 'chebiDetail', label: 'ChEBI' },
  { key: 'nistWebbook', label: 'NIST WebBook' },
  { key: 'epaSCIL', label: 'EPA SCIL' },
  { key: 'epaIRIS', label: 'EPA IRIS' },
  { key: 'epaECOTOX', label: 'EPA ECOTOX' },
  { key: 'epaEnvirofacts', label: 'EPA Envirofacts' },
  { key: 'epaUSEEIO', label: 'EPA USEEIO' },
];

const STATUS_STYLES = {
  ok: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Available' },
  no_data: { icon: MinusCircle, color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200', label: 'No data' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'Unavailable' },
};

export default function ExternalDataSourcePanel({ enrichment, loading, compact = false }) {
  const [activeSource, setActiveSource] = useState(0);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <Loader2 className="w-4 h-4 animate-spin text-[#02988C]" />
        <span className="text-xs text-slate-600">Querying external databases (PubChem, ChEBI, NIST, EPA)…</span>
      </div>
    );
  }

  if (!enrichment) return null;

  const { sources = [], source_status = {}, identity } = enrichment;
  const sourcesByKey = {};
  sources.forEach(s => { sourcesByKey[s.source_db] = s; });

  const activeEntry = SOURCE_ORDER[activeSource];
  const activeStatus = source_status[activeEntry.key];
  const activeSourceData = sourcesByKey[activeEntry.label];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center gap-2">
        <Database className="w-4 h-4 text-[#02988C]" />
        <h4 className="text-sm font-semibold text-slate-800">External data sources</h4>
        {identity?.name && (
          <span className="text-xs text-slate-500 ml-auto truncate">{identity.name}</span>
        )}
      </div>

      {/* Source chips */}
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-100">
        {SOURCE_ORDER.map((s, idx) => {
          const status = source_status[s.key] || 'no_data';
          const st = STATUS_STYLES[status];
          const Icon = st.icon;
          const isActive = idx === activeSource;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSource(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                isActive ? `${st.bg} ${st.color} ring-1 ring-[#02988C]/30` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={st.label}
            >
              <Icon className="w-3 h-3" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Active source fields */}
      <div className="p-4">
        {!activeSourceData ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {(() => { const st = STATUS_STYLES[activeStatus] || STATUS_STYLES.no_data; const Icon = st.icon; return <Icon className={`w-3.5 h-3.5 ${st.color}`} />; })()}
            <span>{(STATUS_STYLES[activeStatus] || STATUS_STYLES.no_data).label}: no data returned from {activeEntry.label} for this compound.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {activeSourceData.fields.map((f, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-700">{f.field}</p>
                  <p className="text-xs text-slate-900 break-words mt-0.5">{String(f.value)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {f.units && <span className="text-[10px] text-slate-500 font-mono">{f.units}</span>}
                  {f.source_url && (
                    <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#02988C] transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            <p className="text-[10px] text-slate-400 pt-1">
              Retrieved {new Date(activeSourceData.retrieved_at).toLocaleString()} from {activeSourceData.source_db}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}