import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const unwrap = (r) => (r?.data?.data ?? r?.data ?? r);

const MODE_OPTIONS = [
  { v: 'balanced', label: 'Balanced' },
  { v: 'safety', label: 'Safety first' },
];

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

const OP_METRICS = [
  ['Accuracy', 'accuracy'],
  ['Balanced accuracy', 'balanced_accuracy'],
  ['Precision', 'precision'],
  ['Recall', 'recall'],
  ['Specificity', 'specificity'],
  ['Macro F1', 'macro_f1'],
  ['False negative rate', 'false_negative_rate'],
];

export default function ValidationTab({ mode, setMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    base44.functions
      .invoke('hazardValidation', { mode })
      .then((r) => {
        const res = unwrap(r);
        if (alive) {
          if (res?.error) throw new Error(res.error);
          setData(res);
        }
      })
      .catch((e) => {
        if (alive) setError(e?.message || String(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [mode]);

  const op = data?.selected_operating_point;
  const cm = op?.confusion_matrix || {};
  const rocData = (data?.roc_curve || []).map((p) => ({ fpr: p.fpr, tpr: p.tpr }));
  const diag = [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }];
  const calData = (data?.calibration_curve || []).map((p) => ({
    predicted: p.predicted,
    actual: p.actual,
    bin_mid: p.bin_mid,
    count: p.count,
  }));
  const calDiag = [{ predicted: 0, actual: 0 }, { predicted: 1, actual: 1 }];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-slate-500">Held-out validation metrics for the trained classifier.</div>
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.v}
              onClick={() => setMode(opt.v)}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                mode === opt.v ? 'bg-[#007850] text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-2 text-red-700">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="ROC-AUC" value={Number(data.headline.roc_auc).toFixed(3)} />
            <StatCard
              label="Expected calibration error"
              value={Number(data.headline.expected_calibration_error).toFixed(3)}
            />
            <StatCard
              label="Test set size"
              value={data.test_set.size}
              sub={`${data.test_set.hazardous} hazardous / ${data.test_set.safe} safe`}
            />
          </div>

          {op && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Confusion matrix ({op.mode} operating point)
              </h3>
              <div className="overflow-x-auto">
                <table className="text-sm border-collapse">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="px-4 py-2 text-slate-500 font-semibold">Predicted safe</th>
                      <th className="px-4 py-2 text-slate-500 font-semibold">Predicted hazardous</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 font-semibold text-slate-500">Actual safe</td>
                      <td className="px-4 py-2 text-center bg-teal-50 border border-teal-100 font-mono">
                        {cm.true_negative ?? '-'}
                      </td>
                      <td className="px-4 py-2 text-center bg-amber-50 border border-amber-100 font-mono">
                        {cm.false_positive ?? '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold text-slate-500">Actual hazardous</td>
                      <td className="px-4 py-2 text-center bg-red-50 border border-red-100 font-mono">
                        {cm.false_negative ?? '-'}
                      </td>
                      <td className="px-4 py-2 text-center bg-teal-50 border border-teal-100 font-mono">
                        {cm.true_positive ?? '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {op && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Operating point metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {OP_METRICS.map(([label, key]) => (
                  <div key={key}>
                    <div className="text-[11px] text-slate-500">{label}</div>
                    <div className="text-sm font-mono font-semibold text-slate-800">
                      {op[key] != null ? Number(op[key]).toFixed(3) : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">ROC curve</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={rocData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  type="number"
                  dataKey="fpr"
                  domain={[0, 1]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'False positive rate', position: 'insideBottom', offset: -2, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="tpr"
                  domain={[0, 1]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'True positive rate', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip />
                <Line type="monotone" dataKey="tpr" stroke="#007850" strokeWidth={2} dot={false} name="ROC" />
                <Line
                  data={diag}
                  dataKey="tpr"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Random baseline"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Calibration (reliability) curve</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={calData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  type="number"
                  dataKey="predicted"
                  domain={[0, 1]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Predicted probability', position: 'insideBottom', offset: -2, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="actual"
                  domain={[0, 1]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Observed frequency', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#6B3FA0" strokeWidth={2} dot={{ r: 3 }} name="Calibration" />
                <Line
                  data={calDiag}
                  dataKey="actual"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Perfect calibration"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Methodology: </span>
              {data.model}, {data.dataset}, {data.split}
            </div>
            {data.honesty_note && <p className="text-xs italic text-slate-500">{data.honesty_note}</p>}
          </div>
        </>
      )}
    </div>
  );
}