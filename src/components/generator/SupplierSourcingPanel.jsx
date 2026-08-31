import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Search,
  ShoppingCart,
  Trash2,
  ExternalLink,
  Boxes,
  ShieldCheck,
  ChevronRight,
  DollarSign,
  Clock,
  Package,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SupplierOptionsModal from './SupplierOptionsModal';

const fmt = (n) => (isFinite(n) ? `$${n.toFixed(2)}` : '$0.00');

// Affiliate/partner suppliers — these get tagged with a partner badge
const PARTNER_SUPPLIERS = ['MakingCosmetics', "Bramble Berry", "Nature's Garden", 'Croda Indie Beauty'];

function isPartnerSupplier(name) {
  return PARTNER_SUPPLIERS.some((p) => name.toLowerCase().includes(p.toLowerCase()));
}

function SupplierSourcingPanel({ formula, batchSize, batchUnit }) {
  const { toast } = useToast();
  const [sourcingData, setSourcingData] = useState({}); // { ingredientName: { suppliers: [], loading, fetched } }
  const [cart, setCart] = useState({}); // { ingredientName: { supplier, pricePer100g, leadTime, moq, url, confidence } }
  const [modalIngredient, setModalIngredient] = useState(null);
  const [bulkFetching, setBulkFetching] = useState(false);

  // Convert batch to grams for cost calculation
  const toGrams = (size, unit) => {
    if (unit === 'g') return size;
    if (unit === 'kg') return size * 1000;
    if (unit === 'lb') return size * 453.592;
    if (unit === 'ml') return size;
    if (unit === 'L') return size * 1000;
    return size;
  };

  const batchGrams = useMemo(() => toGrams(batchSize || 100, batchUnit || 'g'), [batchSize, batchUnit]);

  // Fetch supplier options for a single ingredient
  const fetchSuppliers = useCallback(async (ingredientName) => {
    setSourcingData((prev) => ({ ...prev, [ingredientName]: { ...(prev[ingredientName] || {}), loading: true } }));

    try {
      const result = await base44.functions.invoke('runConsumerLLM', {
        operation: 'supplierSourcing',
        data: { ingredientName }
      });

      const suppliers = (result?.suppliers || []).sort((a, b) => (a.pricePer100g || 0) - (b.pricePer100g || 0));

      setSourcingData((prev) => ({
        ...prev,
        [ingredientName]: { suppliers, loading: false, fetched: true },
      }));
    } catch {
      setSourcingData((prev) => ({
        ...prev,
        [ingredientName]: { suppliers: [], loading: false, fetched: true, error: true },
      }));
      toast({ title: 'Fetch failed', description: `Could not fetch suppliers for ${ingredientName}`, variant: 'destructive' });
    }
  }, [toast]);

  // Bulk fetch all ingredients
  const handleFetchAll = async () => {
    setBulkFetching(true);
    const ingredients = formula.ingredients || [];
    for (const ing of ingredients) {
      if (!sourcingData[ing.chemical_name]?.fetched) {
        await fetchSuppliers(ing.chemical_name);
      }
    }
    setBulkFetching(false);
    toast({ title: 'Sourcing complete', description: 'All supplier options fetched.' });
  };

  const handleAddToCart = (ingredientName, supplierData) => {
    setCart((prev) => {
      const isAlready = prev[ingredientName]?.supplier === supplierData.supplier;
      if (isAlready) {
        const { [ingredientName]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ingredientName]: supplierData };
    });
  };

  const handleRemoveFromCart = (ingredientName) => {
    setCart((prev) => {
      const { [ingredientName]: _removed, ...rest } = prev;
      return rest;
    });
  };

  // Calculate total sourcing cost based on cart selections + batch size
  const cartBreakdown = useMemo(() => {
    return Object.entries(cart).map(([ingredientName, supplierData]) => {
      const ing = formula.ingredients?.find((i) => i.chemical_name === ingredientName);
      const percentage = parseFloat(ing?.percentage) || 0;
      const gramsNeeded = batchGrams * (percentage / 100);
      const cost = (supplierData.pricePer100g / 100) * gramsNeeded;
      return { ingredientName, supplierData, gramsNeeded, cost, percentage };
    });
  }, [cart, formula.ingredients, batchGrams]);

  const totalSourcingCost = cartBreakdown.reduce((s, i) => s + i.cost, 0);
  const unassignedIngredients = (formula.ingredients || []).filter((ing) => !cart[ing.chemical_name]);

  return (
    <div className="space-y-5">
      {/* Header with bulk action */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" /> Supplier Sourcing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Batch: {batchGrams.toFixed(0)}g | {Object.keys(cart).length}/{formula.ingredients?.length || 0} ingredients sourced
          </p>
        </div>
        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleFetchAll} disabled={bulkFetching}>
          {bulkFetching ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Fetching all...</> : <><Search className="w-4 h-4 mr-1.5" /> Fetch All Suppliers</>}
        </Button>
      </div>

      {/* Sourcing Table */}
      <Card className="border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <div className="col-span-3">Ingredient</div>
            <div className="col-span-2">Best Price</div>
            <div className="col-span-2">Supplier</div>
            <div className="col-span-1">Lead Time</div>
            <div className="col-span-1">MOQ</div>
            <div className="col-span-3 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {(formula.ingredients || []).map((ing, idx) => {
              const data = sourcingData[ing.chemical_name];
              const bestSupplier = data?.suppliers?.[0];
              const cartItem = cart[ing.chemical_name];
              const isInCart = !!cartItem;

              return (
                <div key={idx} className="px-4 py-3">
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <p className="font-medium text-slate-900 text-sm truncate">{ing.chemical_name}</p>
                      <p className="text-[10px] text-slate-400">{ing.percentage}%</p>
                    </div>
                    <div className="col-span-2">
                      {data?.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                      ) : bestSupplier ? (
                        <div>
                          <p className="font-bold text-teal-700 text-sm">{fmt(bestSupplier.pricePer100g)}</p>
                          <p className="text-[10px] text-slate-400">per 100g</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">--</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      {bestSupplier ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-slate-700 truncate">{bestSupplier.supplier}</span>
                          {isPartnerSupplier(bestSupplier.supplier) && (
                            <Badge className="text-[9px] bg-violet-100 text-violet-700 flex-shrink-0">Partner</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">--</span>
                      )}
                    </div>
                    <div className="col-span-1">
                      {bestSupplier ? <span className="text-xs text-slate-600">{bestSupplier.leadTime}</span> : <span className="text-xs text-slate-400">--</span>}
                    </div>
                    <div className="col-span-1">
                      {bestSupplier ? <span className="text-xs text-slate-600">{bestSupplier.moq}</span> : <span className="text-xs text-slate-400">--</span>}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-1.5">
                      {!data?.fetched && !data?.loading && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => fetchSuppliers(ing.chemical_name)}>
                          <Search className="w-3 h-3 mr-1" /> Fetch
                        </Button>
                      )}
                      {bestSupplier?.productUrl && (
                        <a href={bestSupplier.productUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                      {data?.suppliers?.length > 1 && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setModalIngredient(ing.chemical_name)}>
                          All ({data.suppliers.length})
                        </Button>
                      )}
                      {bestSupplier && (
                        <Button
                          size="sm"
                          variant={isInCart ? 'default' : 'outline'}
                          className={`h-7 text-xs ${isInCart ? 'bg-teal-600 text-white' : 'border-teal-300 text-teal-700 hover:bg-teal-50'}`}
                          onClick={() => handleAddToCart(ing.chemical_name, bestSupplier)}
                        >
                          {isInCart ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShoppingCart className="w-3 h-3 mr-1" />}
                          {isInCart ? 'In Cart' : 'Add'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{ing.chemical_name}</p>
                        <p className="text-[10px] text-slate-400">{ing.percentage}%</p>
                      </div>
                      {data?.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-teal-500 flex-shrink-0" />
                      ) : bestSupplier ? (
                        <p className="font-bold text-teal-700 text-sm flex-shrink-0">{fmt(bestSupplier.pricePer100g)}</p>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0" onClick={() => fetchSuppliers(ing.chemical_name)}>
                          <Search className="w-3 h-3 mr-1" /> Fetch
                        </Button>
                      )}
                    </div>
                    {bestSupplier && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[10px] ${isPartnerSupplier(bestSupplier.supplier) ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                          {isPartnerSupplier(bestSupplier.supplier) ? 'Partner' : 'Supplier'}: {bestSupplier.supplier}
                        </Badge>
                        <Badge className={`text-[10px] ${bestSupplier.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : bestSupplier.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {bestSupplier.confidence === 'high' ? 'High' : bestSupplier.confidence === 'medium' ? 'Est.' : 'Low'}
                        </Badge>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {bestSupplier.leadTime}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Package className="w-2.5 h-2.5" /> {bestSupplier.moq}</span>
                      </div>
                    )}
                    {bestSupplier && (
                      <div className="flex items-center gap-1.5">
                        {bestSupplier.productUrl && (
                          <a href={bestSupplier.productUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button size="sm" variant="outline" className="h-8 text-xs w-full">
                              <ExternalLink className="w-3 h-3 mr-1" /> Buy
                            </Button>
                          </a>
                        )}
                        {data?.suppliers?.length > 1 && (
                          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setModalIngredient(ing.chemical_name)}>
                            View All ({data.suppliers.length})
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={isInCart ? 'default' : 'outline'}
                          className={`h-8 text-xs ${isInCart ? 'bg-teal-600 text-white' : 'border-teal-300 text-teal-700 hover:bg-teal-50'}`}
                          onClick={() => handleAddToCart(ing.chemical_name, bestSupplier)}
                        >
                          {isInCart ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShoppingCart className="w-3 h-3 mr-1" />}
                          {isInCart ? 'In Cart' : 'Add'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Total Sourcing Cost Summary */}
      {cartBreakdown.length > 0 && (
        <Card className="border-teal-300 bg-teal-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" /> Sourcing Cart Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cartBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-teal-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{item.ingredientName}</p>
                  <p className="text-[10px] text-slate-500">
                    {item.supplierData.supplier} | {item.gramsNeeded.toFixed(1)}g @ {fmt(item.supplierData.pricePer100g)}/100g
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-teal-700">{fmt(item.cost)}</span>
                  <button onClick={() => handleRemoveFromCart(item.ingredientName)} className="p-1 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t-2 border-teal-300">
              <span className="font-bold text-slate-800">Total Sourcing Cost</span>
              <span className="text-xl font-extrabold text-teal-700">{fmt(totalSourcingCost)}</span>
            </div>
            {unassignedIngredients.length > 0 && (
              <p className="text-[10px] text-slate-400 pt-1">
                {unassignedIngredients.length} ingredient(s) not yet added to cart
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supplier Options Modal */}
      {modalIngredient && sourcingData[modalIngredient] && (
        <SupplierOptionsModal
          isOpen={!!modalIngredient}
          onClose={() => setModalIngredient(null)}
          ingredientName={modalIngredient}
          suppliers={sourcingData[modalIngredient].suppliers || []}
          onAddToCart={handleAddToCart}
          cartSelections={cart}
        />
      )}
    </div>
  );
}

export default SupplierSourcingPanel;