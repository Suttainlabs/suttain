import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldAlert, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';

const unwrap = (r) => (r?.data?.data ?? r?.data ?? r);

const MODE_OPTIONS = [
  { v: 'balanced', label: 'Balanced' },
  { v: 'safety', label: 'Safety first' },
];

function StatTile({ label, value, accent = false }) {
  return (
    <div className={`border rounded-xl p-4 ${accent ? 'bg-[#9531F5]/5 border-[#9531F5]/20' : 'bg-white border-[#E5E7EB]'}`}>
      <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ? 'text-[#9531F5]' : 'text-[#02988C]'}`}>{value}</div>
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
    return () => { alive = false; };
  }, [mode]);

  const op = data?.selected_operating_point;
  const cm = op?.confusion_matrix || {};
  const rocData = (data?.roc_curve || []).map((p) => ({ fpr: p.fpr, tpr: p.tpr }));
  const diag = [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }];
  const calData = (data?.calibration_curve || []).map((p) => ({ predicted: p.predicted, actual: p.actual }));
  const calDiag = [{ predicted: 0, actual: 0 }, { predicted: 1, actual: 1 }];

  const handleDownload = () => {
    if (!data) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16); doc.setTextColor(2, 152, 140);
    doc.text("Suttain HazardEngine: Validation Report", 20, y); y += 10;
    doc.setFontSize(10); doc.setTextColor(80, 80, 80);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y); y += 7;
    doc.text(`Model: ${data.model}`, 20, y); y += 7;
    doc.text(`Dataset: ${data.dataset}`, 20, y); y += 7;
    doc.text(`Split: ${data.split}`, 20, y); y += 10;

    doc.setFontSize(13); doc.setTextColor(10, 31, 29);
    doc.text("Headline Metrics", 20, y); y += 7;
    doc.setFontSize(10); doc.setTextColor(80, 80, 80);
    doc.text(`ROC-AUC: ${Number(data.headline.roc_auc).toFixed(4)}`, 20, y); y += 6;
    doc.text(`Expected Calibration Error: ${Number(data.headline.expected_calibration_error).toFixed(4)}`, 20, y); y += 6;
    doc.text(`Test set: ${data.test_set.size} (${data.test_set.hazardous} hazardous, ${data.test_set.safe} safe)`, 20, y); y += 10;

    if (op) {
      doc.setFontSize(13); doc.setTextColor(10, 31, 29);
      doc.text(`Operating Point (${op.mode})`, 20, y); y += 7;
      doc.setFontSize(10); doc.setTextColor(80, 80, 80);
      doc.text(`Accuracy: ${Number(op.accuracy).toFixed(4)}`, 20, y); y += 6;
      doc.text(`Recall: ${Number(op.recall).toFixed(4)}`, 20, y); y += 6;
      doc.text(`Macro F1: ${Number(op.macro_f1).toFixed(4)}`, 20, y); y += 6;
      doc.text(`Precision: ${Number(op.precision).toFixed(4)}`, 20, y); y += 6;
      doc.text(`Specificity: ${Number(op.specificity).toFixed(4)}`, 20, y); y += 10;
      doc.text(`Confusion Matrix: TN=${cm.true_negative}, FP=${cm.false_positive}, FN=${cm.false_negative}, TP=${cm.true_positive}`, 20, y); y += 10;
    }

    if (data.honesty_note) {
      doc.setFontSize(9); doc.setTextColor(120, 120, 120);
      const lines = doc.splitTextToSize(data.honesty_note, 170);
      doc.text(lines, 20, y);
    }
    doc.save("suttain-hazard-validation-report.pdf");
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-[#4B5563]">Held-out validation metrics for the trained classifier.</div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-[#E5E7EB] p-0.5">
            {MODE_OPTIONS.map((opt) => (
              <button key={opt.v} onClick={() => setMode(opt.v)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${mode === opt.v ? 'bg-[#02988C] text-white' : 'text-[#4B5563] hover:bg-slate-50'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={handleDownload} disabled={!data}
            className="inline-flex items-center gap-1.5 bg-[#9531F5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#7D26CC] transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" /> Download report
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-[#6B7280]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-2xl p-5 flex items-center gap-2 text-[#DC2626]">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Headline stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatTile label="ROC-AUC" value={Number(data.headline.roc_auc).toFixed(3)} accent />
            <StatTile label="ECE" value={Number(data.headline.expected_calibration_error).toFixed(3)} accent />
            <StatTile label="Accuracy" value={op ? Number(op.accuracy).toFixed(3) : '-'} />
            <StatTile label="Recall" value={op ? Number(op.recall).toFixed(3) : '-'} />
            <StatTile label="F1 score" value={op ? Number(op.macro_f1).toFixed(3) : '-'} />
          </div>

          {/* Confusion Matrix */}
          {op && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#0A1F1D] mb-3">Confusion matrix ({op.mode} operating point)</h3>
              <div className="overflow-x-auto">
                <table className="text-sm border-collapse">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="px-4 py-2 text-[#4B5563] font-semibold">Predicted safe</th>
                      <th className="px-4 py-2 text-[#4B5563] font-semibold">Predicted hazardous</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 font-semibold text-[#4B5563]">Actual safe</td>
                      <td className="px-4 py-2 text-center bg-[#02988C]/10 border border-[#02988C]/20 font-mono font-bold text-[#02988C]">{cm.true_negative ?? '-'}</td>
                      <td className="px-4 py-2 text-center bg-[#DC2626]/10 border border-[#DC2626]/20 font-mono font-bold text-[#DC2626]">{cm.false_positive ?? '-'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold text-[#4B5563]">Actual hazardous</td>
                      <td className="px-4 py-2 text-center bg-[#DC2626]/10 border border-[#DC2626]/20 font-mono font-bold text-[#DC2626]">{cm.false_negative ?? '-'}</td>
                      <td className="px-4 py-2 text-center bg-[#02988C]/10 border border-[#02988C]/20 font-mono font-bold text-[#02988C]">{cm.true_positive ?? '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Operating point metrics */}
          {op && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#0A1F1D] mb-3">Operating point metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {OP_METRICS.map(([label, key]) => (
                  <div key={key}>
                    <div className="text-[11px] text-[#6B7280]">{label}</div>
                    <div className="text-sm font-mono font-semibold text-[#0A1F1D]">{op[key] != null ? Number(op[key]).toFixed(3) : '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROC Curve */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0A1F1D] mb-3">ROC curve (AUC = {Number(data.headline.roc_auc).toFixed(3)})</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={rocData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" dataKey="fpr" domain={[0, 1]} tick={{ fontSize: 11 }}
                  label={{ value: 'False positive rate', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis type="number" dataKey="tpr" domain={[0, 1]} tick={{ fontSize: 11 }}
                  label={{ value: 'True positive rate', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="tpr" stroke="#02988C" strokeWidth={2} dot={false} name="ROC" />
                <Line data={diag} dataKey="tpr" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Random baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Calibration Curve */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0A1F1D] mb-3">Calibration (reliability) curve</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={calData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" dataKey="predicted" domain={[0, 1]} tick={{ fontSize: 11 }}
                  label={{ value: 'Predicted probability', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis type="number" dataKey="actual" domain={[0, 1]} tick={{ fontSize: 11 }}
                  label={{ value: 'Observed frequency', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#9531F5" strokeWidth={2} dot={{ r: 3 }} name="Calibration" />
                <Line data={calDiag} dataKey="actual" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Perfect calibration" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Methodology */}
          <div className="bg-[#F0FDFA] border border-[#02988C]/10 rounded-2xl p-4 space-y-1">
            <div className="text-xs text-[#4B5563]">
              <span className="font-bold text-[#0A1F1D]">Methodology: </span>
              {data.model}, {data.dataset}, {data.split}
            </div>
            {data.honesty_note && <p className="text-xs italic text-[#6B7280]">{data.honesty_note}</p>}
          </div>
        </>
      )}
    </div>
  );
}