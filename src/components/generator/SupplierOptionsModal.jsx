import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShieldCheck, Leaf, Clock, Boxes, ShoppingCart } from 'lucide-react';

const fmt = (n) => (isFinite(n) ? `$${n.toFixed(2)}` : '$0.00');

export default function SupplierOptionsModal({ isOpen, onClose, ingredientName, suppliers, onAddToCart, cartSelections }) {
  if (!ingredientName) return null;

  const inCart = cartSelections[ingredientName];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            All Suppliers: {ingredientName}
          </DialogTitle>
          <p className="text-sm text-slate-500">{suppliers.length} options ranked by lowest price</p>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {suppliers.map((s, i) => {
            const selected = inCart?.supplier === s.supplier;
            return (
              <div key={i} className={`p-3 rounded-lg border-2 transition-all ${selected ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 text-sm">{s.supplier}</p>
                      <Badge
                        className={`text-[10px] ${
                          s.confidence === 'high'
                            ? 'bg-emerald-100 text-emerald-700'
                            : s.confidence === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.confidence === 'high' ? 'High confidence' : s.confidence === 'medium' ? 'Estimate' : 'Low confidence'}
                      </Badge>
                      {s.sourcingScore !== undefined && (
                        <Badge className="text-[10px] bg-teal-100 text-teal-700">
                          <Leaf className="w-2.5 h-2.5 mr-0.5 inline" /> {s.sourcingScore}/100
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {s.leadTime}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Boxes className="w-3 h-3" /> MOQ: {s.moq}
                      </span>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-teal-600 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Visit
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-teal-700">{fmt(s.pricePer100g)}</p>
                    <p className="text-[10px] text-slate-400">per 100g</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    className={`h-8 text-xs ${selected ? 'bg-teal-600 text-white' : 'border-teal-300 text-teal-700 hover:bg-teal-50'}`}
                    onClick={() => onAddToCart(ingredientName, s)}
                  >
                    {selected ? (
                      <><ShieldCheck className="w-3 h-3 mr-1" /> Selected</>
                    ) : (
                      <><ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart</>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" onClick={onClose} className="text-sm">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}