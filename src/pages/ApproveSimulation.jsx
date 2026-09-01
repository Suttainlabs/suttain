import React, { useState, useEffect } from 'react';
import { resolveSupervisorApproval } from '@/functions/resolveSupervisorApproval';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, FlaskConical } from 'lucide-react';

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-0.5">{value || ':'}</p>
    </div>
  );
}

export default function ApproveSimulation() {
  const token = new URLSearchParams(window.location.search).get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [record, setRecord] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No approval token provided. Use the link from your email.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await resolveSupervisorApproval({ token, action: 'preview' });
        const data = res?.data ?? res;
        if (data?.error) {
          setError(data.error);
        } else {
          setRecord(data);
        }
      } catch (e) {
        setError(e.response?.data?.error || e.message || 'Failed to load approval request');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const submit = async (action) => {
    setSubmitting(true);
    try {
      const res = await resolveSupervisorApproval({ token, action, reason: reason.trim() || undefined });
      const data = res?.data ?? res;
      if (data?.error) {
        setError(data.error);
      } else {
        setResult(data);
        setRecord((prev) => prev ? { ...prev, status: data.status, decided_date: data.decided_date } : prev);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const snapshot = record?.simulation_snapshot || {};
  const risk = snapshot.risk_assessment || {};
  const safety = snapshot.safety_status || { level: 'UNKNOWN', warnings: [] };
  const reaction = snapshot.reaction_details || {};
  const chems = snapshot.chemicals || [];
  const conditions = snapshot.experimentalConditions || snapshot.experimental_analysis || {};

  const isResolved = record && record.status !== 'pending';
  const isApproved = (record?.status === 'approved') || (result?.status === 'approved');
  const isRejected = (record?.status === 'rejected') || (result?.status === 'rejected');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal branded header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
            alt="Suttain"
            className="h-7 w-auto"
          />
          <span className="text-xs font-semibold text-slate-400 ml-1">Supervisor approval</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading approval request...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 mb-1">Unable to load request</h1>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && record && (
          <div className="space-y-5">
            {/* Heading */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#02988C] to-[#09D2FF] flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-slate-900">Simulation approval request</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Requested by <span className="font-semibold text-slate-700">{record.requester_name || 'a Suttain user'}</span>
                    {' on '}
                    {record.requested_date ? new Date(record.requested_date).toLocaleString() : ''}
                  </p>
                </div>
                <StatusBadge status={record.status} />
              </div>
            </div>

            {/* Already resolved banner */}
            {isResolved && (
              <div className={`rounded-2xl p-5 border flex items-start gap-3 ${
                isApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
              }`}>
                {isApproved
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-bold ${isApproved ? 'text-emerald-800' : 'text-red-800'}`}>
                    {isApproved ? 'You approved this simulation' : 'You rejected this simulation'}
                  </p>
                  {record.decided_date && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Decided {new Date(record.decided_date).toLocaleString()}
                    </p>
                  )}
                  {record.supervisor_decision_reason && (
                    <p className="text-xs text-slate-600 mt-1">"{record.supervisor_decision_reason}"</p>
                  )}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Chemicals</h2>
                <div className="flex flex-wrap gap-2">
                  {chems.length > 0 ? chems.map((c, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                      {c.name || c.scientific_name || 'Unknown'}
                      {c.concentration ? ` · ${c.concentration}${c.concentrationUnit || ''}` : ''}
                    </span>
                  )) : <span className="text-sm text-slate-400">No chemicals listed.</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Stat label="Safety level" value={safety.level} />
                <Stat label="Risk score" value={risk.overall_risk_score != null ? `${risk.overall_risk_score}/100` : null} />
                <Stat label="Health impact" value={risk.health_impact_score != null ? `${risk.health_impact_score}/100` : null} />
                <Stat label="Env. impact" value={risk.environmental_impact_score != null ? `${risk.environmental_impact_score}/100` : null} />
                <Stat label="Reactivity" value={risk.reactivity_score != null ? `${risk.reactivity_score}/100` : null} />
                <Stat label="Reaction type" value={snapshot.energy_profile?.type} />
              </div>

              {risk.recommendation && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Recommendation</p>
                  <p className="text-sm text-slate-700">{risk.recommendation}</p>
                </div>
              )}

              {reaction.balanced_equation && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Balanced equation</p>
                  <p className="text-sm text-slate-700 font-mono">{reaction.balanced_equation}</p>
                </div>
              )}

              {safety.warnings && safety.warnings.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Safety warnings</h2>
                  <ul className="space-y-1.5">
                    {safety.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Object.keys(conditions).length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Experimental conditions</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(conditions).slice(0, 8).map(([k, v]) => (
                      v != null && v !== '' ? (
                        <span key={k} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                          <span className="text-slate-400">{k}:</span> <span className="font-semibold text-slate-700">{String(v)}</span>
                        </span>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Decision actions: only when pending and not yet submitted */}
            {!isResolved && !result && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#02988C]" />
                  <h2 className="text-sm font-bold text-slate-800">Your decision</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Note to requester (optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Add any comments or conditions for the requester..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => submit('reject')}
                    disabled={submitting}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Reject
                  </Button>
                  <Button
                    onClick={() => submit('approve')}
                    disabled={submitting}
                    className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white sm:flex-1"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Approve simulation
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  Confirming as <span className="font-semibold text-slate-600">{record.supervisor_name}</span>. The requester will be notified by email.
                </p>
              </div>
            )}

            {/* Post-submit confirmation */}
            {result && (
              <div className={`rounded-2xl p-6 border text-center ${
                result.status === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
              }`}>
                {result.status === 'approved'
                  ? <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                  : <XCircle className="w-10 h-10 mx-auto text-red-600 mb-2" />}
                <p className={`text-base font-bold ${result.status === 'approved' ? 'text-emerald-800' : 'text-red-800'}`}>
                  {result.status === 'approved' ? 'Simulation approved' : 'Simulation rejected'}
                </p>
                <p className="text-sm text-slate-500 mt-1">The requester has been notified. You can close this window.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700 border-red-200' }
  };
  const m = map[status] || map.pending;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${m.classes} flex-shrink-0`}>
      {m.label}
    </span>
  );
}