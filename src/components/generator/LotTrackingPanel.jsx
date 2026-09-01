import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, CalendarClock, Plus, Trash2, Link2 } from 'lucide-react';

export default function LotTrackingPanel({ formula, batchSize, batchUnit, onLotsUpdate }) {
  const [lots, setLots] = useState({});

  // Initialize lot entries for each ingredient
  useEffect(() => {
    const newLots = {};
    (formula.ingredients || []).forEach((ing) => {
      if (!lots[ing.chemical_name]) {
        newLots[ing.chemical_name] = { supplier: '', lot_number: '', expiration_date: '' };
      } else {
        newLots[ing.chemical_name] = lots[ing.chemical_name];
      }
    });
    setLots(newLots);
  }, [formula.ingredients]);

  const handleLotChange = (ingredientName, field, value) => {
    setLots((prev) => ({
      ...prev,
      [ingredientName]: { ...prev[ingredientName], [field]: value },
    }));
  };

  // Calculate earliest expiration from all lots
  const earliestExpiration = useMemo(() => {
    const dates = Object.values(lots)
      .map((l) => l.expiration_date)
      .filter(Boolean)
      .sort();
    return dates[0] || null;
  }, [lots]);

  // Lot expiration alerts (within 30 days)
  const lotAlerts = useMemo(() => {
    const alerts = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    Object.entries(lots).forEach(([ingredient, lot]) => {
      if (lot.expiration_date) {
        const expDate = new Date(lot.expiration_date);
        if (expDate < now) {
          alerts.push({ ingredient, date: lot.expiration_date, type: 'expired' });
        } else if (expDate < thirtyDaysFromNow) {
          alerts.push({ ingredient, date: lot.expiration_date, type: 'expiring' });
        }
      }
    });
    return alerts;
  }, [lots]);

  // Notify parent
  useEffect(() => {
    onLotsUpdate?.(lots, earliestExpiration, lotAlerts);
  }, [lots, earliestExpiration, lotAlerts]);

  const filledLots = Object.values(lots).filter((l) => l.lot_number).length;
  const totalIngredients = (formula.ingredients || []).length;

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-600" /> Lot Tracking
          <Badge className="text-[10px] bg-slate-100 text-slate-600 ml-auto">{filledLots}/{totalIngredients} lots linked</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lot Expiration Alerts */}
        {lotAlerts.length > 0 && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">Lot Expiration Alerts</p>
            </div>
            <ul className="space-y-1">
              {lotAlerts.map((alert, i) => (
                <li key={i} className="text-xs text-red-700 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${alert.type === 'expired' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <strong>{alert.ingredient}</strong>: {alert.type === 'expired' ? 'EXPIRED' : 'expires within 30 days'} on {alert.date}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lot Entry Table */}
        <div className="space-y-2">
          {(formula.ingredients || []).map((ing, idx) => {
            const lot = lots[ing.chemical_name] || { supplier: '', lot_number: '', expiration_date: '' };
            return (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{ing.chemical_name}</p>
                  <span className="text-xs text-slate-400">{ing.percentage}%</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Supplier name"
                    value={lot.supplier}
                    onChange={(e) => handleLotChange(ing.chemical_name, 'supplier', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Lot number"
                    value={lot.lot_number}
                    onChange={(e) => handleLotChange(ing.chemical_name, 'lot_number', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="date"
                    placeholder="Expiration"
                    value={lot.expiration_date}
                    onChange={(e) => handleLotChange(ing.chemical_name, 'expiration_date', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Earliest Expiration */}
        {earliestExpiration && (
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-teal-800">Batch Expiration (earliest lot): {earliestExpiration}</p>
              <p className="text-xs text-teal-600">Auto-calculated from the earliest-expiring ingredient lot</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}