import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Daily counts of the user's own simulations, formulas and scans over the last `days` days.
// Built only from records that exist; nothing is estimated.
export default function useActivitySeries(user, days = 30) {
  const [state, setState] = useState({ loading: true, series: [], totals: { simulation: 0, formula: 0, scan: 0 } });

  useEffect(() => {
    if (!user) return;
    let active = true;
    const since = Date.now() - days * 86400000;
    const filter = { created_by: user.email };
    const fetchDates = (entity) =>
      entity.filter(filter, '-created_date', 500, 0, ['created_date']).catch(() => []);

    Promise.all([
      fetchDates(base44.entities.Simulation),
      fetchDates(base44.entities.Formula),
      fetchDates(base44.entities.BarcodeHistory),
    ]).then(([sims, formulas, scans]) => {
      if (!active) return;
      const buckets = new Map();
      for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, { date: key, label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), simulation: 0, formula: 0, scan: 0 });
      }
      const totals = { simulation: 0, formula: 0, scan: 0 };
      const add = (rows, type) => (rows || []).forEach(r => {
        const t = new Date(r.created_date).getTime();
        if (!t || t < since) return;
        const b = buckets.get(new Date(t).toISOString().slice(0, 10));
        if (b) { b[type] += 1; totals[type] += 1; }
      });
      add(sims, 'simulation'); add(formulas, 'formula'); add(scans, 'scan');
      setState({ loading: false, series: [...buckets.values()], totals });
    });
    return () => { active = false; };
  }, [user, days]);

  return state;
}
