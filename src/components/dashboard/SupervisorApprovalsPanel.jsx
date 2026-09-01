import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Clock, CheckCircle2, XCircle, Mail, ChevronRight } from 'lucide-react';
import ReportCustomizationModal from '@/components/simulator/ReportCustomizationModal';

const STATUS_META = {
  pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
};

export default function SupervisorApprovalsPanel() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportFor, setReportFor] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.SupervisorApproval.list('-requested_date', 50);
      setItems(res || []);
    } catch (e) {
      console.error('Failed to load approval requests', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleGenerate = async (options) => {
    if (!reportFor) return;
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateLabReport', {
        approval_token: reportFor.token,
        persona: reportFor.persona,
        customization: options
      });
      const pdfData = response?.data;
      if (!pdfData) throw new Error('No PDF data received');
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (reportFor.chemicals_summary || 'lab-report').replace(/[^a-z0-9]/gi, '-').slice(0, 40);
      a.download = `lab-report-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { window.URL.revokeObjectURL(url); a.remove(); }, 100);
      setReportFor(null);
    } catch (e) {
      console.error('Report generation failed', e);
      alert(e.response?.data?.error || e.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-5 flex items-center gap-3 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading approval requests...
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#02988C]" />
          Supervisor approvals
          <Badge variant="outline" className="text-[10px] ml-1">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const meta = STATUS_META[item.status] || STATUS_META.pending;
          const Icon = meta.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${meta.classes} flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {item.chemicals_summary || 'Chemical simulation'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Supervisor: {item.supervisor_name}
                  {' · '}
                  {item.requested_date ? new Date(item.requested_date).toLocaleDateString() : ''}
                  {item.status === 'rejected' && item.supervisor_decision_reason
                    ? ` · ${item.supervisor_decision_reason}`
                    : ''}
                </p>
              </div>
              <Badge variant="outline" className={`text-[11px] ${meta.classes} flex-shrink-0`}>
                {meta.label}
              </Badge>
              {item.status === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReportFor(item)}
                  className="text-[#02988C] flex-shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Report
                </Button>
              )}
              {item.status === 'rejected' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(createPageUrl('Simulator'))}
                  className="text-slate-500 flex-shrink-0"
                >
                  Resubmit <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>

      <ReportCustomizationModal
        isOpen={!!reportFor}
        onClose={() => setReportFor(null)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        persona={reportFor?.persona}
      />
    </Card>
  );
}