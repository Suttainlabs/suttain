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
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search the web for REAL product listings for the ingredient "${ingredientName}" from wholesale cosmetic ingredient suppliers, chemical distributors, or bulk suppliers. Focus on these platforms first: MakingCosmetics, Lotioncrafter, Wholesale Supplies Plus (formerly Bramble Berry), Nature's Garden, Croda Indie Beauty, Formulator Sample Shop,.bulkapothecary, and chemistry supply companies like Sigma-Aldrich or Fisher Scientific for lab-grade chemicals.

CRITICAL: Only return suppliers where you found an ACTUAL product page with a visible price. Do NOT estimate or guess prices. If you cannot find a real listing, return fewer suppliers rather than making one up.

For each real listing found, provide:
- supplier name (the actual company/store name)
- productUrl: the direct URL to the actual product page you found (must be a real URL you visited, not a fabricated search URL)
- packageName: the exact package size from the listing (e.g. "1 gallon", "500ml", "1kg", "16 oz")
- packagePrice: the total price in USD shown on the listing (number only, no $ sign)
- pricePer100g: calculated as (packagePrice / total grams in package) * 100. Convert units: 1 gallon water-based = 3785g, 1 gallon = 3.785L, 1 oz = 28.35g, 1 lb = 453.6g, 1 kg = 1000g
- leadTime: typical lead time for this supplier (e.g. "2-3 days", "1 week")
- moq: minimum order quantity shown on the listing (e.g. "100g", "1kg", "No MOQ")
- confidence: "high" ONLY if you found a real product page with an actual listed price. "medium" if you found the supplier's website but had to estimate the price from a similar product. "low" if you are guessing. Never use "high" unless the URL is a real product page.
- sourcingScore: 0-100 based on whether the supplier emphasizes natural/organic/sustainable sourcing

Exclude consumer retail stores (CVS, Walmart, Target, Walgreens, Amazon marketplace resellers) unless the ingredient is only available as a consumer product. Prioritize bulk/wholesale suppliers.

Rank suppliers by pricePer100g (lowest first). Return only suppliers with real URLs.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            suppliers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  supplier: { type: 'string' },
                  productUrl: { type: 'string' },
                  packageName: { type: 'string' },
                  packagePrice: { type: 'number' },
                  pricePer100g: { type: 'number' },
                  leadTime: { type: 'string' },
                  moq: { type: 'string' },
                  confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                  sourcingScore: { type: 'number' },
                },
              },
            },
          },
        },
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