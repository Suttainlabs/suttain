import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Boxes } from 'lucide-react';
import SupplierSourcingPanel from './SupplierSourcingPanel';
import SupplierManager from '../suppliers/SupplierManager';
import SupplierVerificationPanel from '../suppliers/SupplierVerificationPanel';

/**
 * Unified Business Mode sourcing tab.
 * Combines supplier discovery + procurement cart, supplier verification,
 * the saved supplier directory, and per-ingredient supplier linking.
 */
export default function SourcingTab({ formula, batchSize, batchUnit, ingredientAmounts, onLinkSupplier }) {
  return (
    <div className="space-y-6">
      {/* 1. Find suppliers per ingredient + procurement cart */}
      <SupplierSourcingPanel formula={formula} batchSize={batchSize} batchUnit={batchUnit} />

      {/* 2. Invite suppliers to verify ingredient data (only when formula is saved) */}
      {formula.id && <SupplierVerificationPanel formula={formula} />}

      {/* 3. Saved supplier directory */}
      <SupplierManager />

      {/* 4. Per-ingredient supplier linking */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Boxes className="w-4 h-4 text-violet-600" />
            Ingredient Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(formula.ingredients || []).map((ing, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{ing.chemical_name}</p>
                <p className="text-xs text-slate-600">
                  {ing.percentage}% | {ingredientAmounts[idx]?.value || '-'} {ingredientAmounts[idx]?.unit || ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLinkSupplier?.(ing.chemical_name)}
              >
                Link Suppliers
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}