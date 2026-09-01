import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { TestTube, FlaskConical, QrCode, ArrowRight } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function RecentActivityList() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const [sims, formulas, scans] = await Promise.all([
        base44.entities.Simulation.list('-created_date', 4).catch(() => []),
        base44.entities.Formula.list('-created_date', 4).catch(() => []),
        base44.entities.BarcodeHistory.list('-created_date', 4).catch(() => []),
      ]);

      const merged = [
        ...(sims || []).map(s => ({
          id: s.id,
          type: 'simulation',
          title: Array.isArray(s.chemicals) && s.chemicals.length ? s.chemicals.join(' + ') : 'Simulation',
          subtitle: s.reaction_summary || `${s.risk_score != null ? `Risk ${s.risk_score}` : 'Chemical interaction'}`,
          date: s.created_date,
          href: createPageUrl('Simulator'),
          icon: TestTube,
        })),
        ...(formulas || []).map(f => ({
          id: f.id,
          type: 'formula',
          title: f.name || 'Untitled formula',
          subtitle: f.product_type || (f.status === 'draft' ? 'Draft' : 'Completed'),
          date: f.created_date,
          href: createPageUrl('FormulaBuilder'),
          icon: FlaskConical,
        })),
        ...(scans || []).map(b => ({
          id: b.id,
          type: 'scan',
          title: b.product_name || 'Scanned product',
          subtitle: b.barcode || `${b.ingredient_count || 0} ingredients`,
          date: b.created_date,
          href: createPageUrl('BarcodeScanner'),
          icon: QrCode,
        })),
      ]
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 6);

      setItems(merged);
    } catch (e) {
      console.error('Failed to load activity', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Recent activity</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          [0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-1/3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-slate-50 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : items && items.length > 0 ? (
          items.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#02988C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                  <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(item.date)}</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#02988C] transition-colors flex-shrink-0" />
              </Link>
            );
          })
        ) : (
          <div className="px-4 py-10 text-center">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <TestTube className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">No activity yet</p>
            <p className="text-xs text-slate-400 mt-1">Run a simulation or scan a product to see it here.</p>
          </div>
        )}
      </div>
    </section>
  );
}