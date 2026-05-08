import React, { useState, useCallback, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, Loader2, CheckCircle, AlertTriangle, Leaf,
  Shield, HeartPulse, ChevronRight, Trophy, Minus, X, RefreshCw,
  Cloud, Clock, Trash2, History
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuthContext from '../auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getRatingLabel = (score) => {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  if (score >= 70) return { label: 'Good', color: 'text-teal-600', bg: 'bg-teal-100' };
  if (score >= 50) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-100' };
  return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
};

const ScoreBar = ({ score, color }) => {
  const barColor = color || (score >= 85 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500');
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
    </div>
  );
};

function computeScores(product) {
  if (!product?.ingredients?.length) return { safety: 0, sustainability: 0, overall: 0 };
  const total = product.ingredients.reduce((acc, ing) => {
    acc.safety += typeof ing.safety === 'number' ? ing.safety : 50;
    acc.sustainability += typeof ing.sustainability === 'number' ? ing.sustainability : 50;
    return acc;
  }, { safety: 0, sustainability: 0 });
  const safety = Math.round(total.safety / product.ingredients.length);
  const sustainability = Math.round(total.sustainability / product.ingredients.length);
  const hazardPenalty = Math.max(0, 100 - (product.hazards?.length || 0) * 15);
  const overall = Math.round(safety * 0.5 + sustainability * 0.3 + hazardPenalty * 0.2);
  return { safety, sustainability, overall };
}

// ── Single product selector panel ────────────────────────────────────────────
function ProductSlot({ label, product, onLookup, onClear, isLoading }) {
  const [barcode, setBarcode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (barcode.trim()) onLookup(barcode.trim());
  };

  if (product) {
    const scores = computeScores(product);
    const { label: rLabel, bg, color } = getRatingLabel(scores.overall);
    return (
      <Card className="flex-1 min-w-0 border-2 border-teal-200 bg-white shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Badge className="text-[10px] bg-slate-100 text-slate-600 mb-1">{label}</Badge>
              <h3 className="font-bold text-slate-800 leading-tight text-base line-clamp-2">{product.name}</h3>
              <p className="text-xs text-slate-500">{product.brand}</p>
            </div>
            <button onClick={onClear} className="p-1 rounded-md hover:bg-slate-100 flex-shrink-0">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${bg} ${color} w-fit`}>
            <Trophy className="w-4 h-4" />
            Overall: {scores.overall}/100 — {rLabel}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Safety</span>
              <span className="font-semibold">{scores.safety}%</span>
            </div>
            <ScoreBar score={scores.safety} />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> Eco Score</span>
              <span className="font-semibold">{scores.sustainability}%</span>
            </div>
            <ScoreBar score={scores.sustainability} color="bg-emerald-500" />
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Hazards</span>
            <span className={`font-bold ${product.hazards?.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {product.hazards?.length || 0}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Ingredients</span>
            <span className="font-semibold">{product.ingredients?.length || 0}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 min-w-0 border-2 border-dashed border-slate-300 bg-slate-50/60">
      <CardHeader className="pb-2">
        <Badge className="text-[10px] bg-slate-100 text-slate-600 w-fit">{label}</Badge>
        <CardTitle className="text-sm text-slate-500 font-normal">Scan or enter a barcode</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            placeholder="Enter barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ''))}
            className="h-9 text-sm text-center"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" className="w-full btn-primary" disabled={isLoading || !barcode}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-3.5 h-3.5 mr-1.5" />Look Up</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Side-by-side comparison row ───────────────────────────────────────────────
function CompareRow({ label, valueA, valueB, renderCell, winner }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3 border-b border-slate-100 last:border-0">
      <div className={`${winner === 'A' ? 'ring-2 ring-teal-400' : ''} rounded-lg`}>
        {renderCell(valueA, winner === 'A')}
      </div>
      <div className="text-center">
        <span className="text-[11px] font-semibold text-slate-500 block leading-tight">{label}</span>
        {winner === 'A' && <span className="text-[10px] text-teal-600">◀ Better</span>}
        {winner === 'B' && <span className="text-[10px] text-teal-600">Better ▶</span>}
        {winner === 'tie' && <Minus className="w-3 h-3 text-slate-400 mx-auto" />}
      </div>
      <div className={`${winner === 'B' ? 'ring-2 ring-teal-400' : ''} rounded-lg`}>
        {renderCell(valueB, winner === 'B')}
      </div>
    </div>
  );
}

// ── Main comparison table ─────────────────────────────────────────────────────
function ComparisonTable({ productA, productB }) {
  const scoresA = computeScores(productA);
  const scoresB = computeScores(productB);

  const win = (a, b, lower = false) => {
    if (a === b) return 'tie';
    if (lower) return a < b ? 'A' : 'B';
    return a > b ? 'A' : 'B';
  };

  const ScoreCell = (score, isWinner) => (
    <div className={`text-center p-2 rounded-lg ${isWinner ? 'bg-teal-50' : 'bg-slate-50'}`}>
      <p className={`text-xl font-extrabold ${isWinner ? 'text-teal-600' : 'text-slate-600'}`}>{score}</p>
      <p className={`text-[10px] font-medium ${getRatingLabel(score).color}`}>{getRatingLabel(score).label}</p>
      <ScoreBar score={score} />
    </div>
  );

  const HazardCell = (count, isWinner) => (
    <div className={`text-center p-2 rounded-lg ${isWinner ? 'bg-teal-50' : 'bg-slate-50'}`}>
      <p className={`text-xl font-extrabold ${count === 0 ? 'text-emerald-600' : count > 2 ? 'text-red-600' : 'text-amber-600'}`}>{count}</p>
      <p className="text-[10px] text-slate-500">hazards</p>
    </div>
  );

  const IngredientCell = (count, isWinner) => (
    <div className={`text-center p-2 rounded-lg ${isWinner ? 'bg-teal-50' : 'bg-slate-50'}`}>
      <p className="text-xl font-extrabold text-slate-700">{count}</p>
      <p className="text-[10px] text-slate-500">ingredients</p>
    </div>
  );

  const RiskCell = (risk, isWinner) => {
    const cfg = {
      low: { label: 'Low Risk', cls: 'text-emerald-700 bg-emerald-100' },
      medium: { label: 'Med Risk', cls: 'text-amber-700 bg-amber-100' },
      high: { label: 'High Risk', cls: 'text-red-700 bg-red-100' },
    }[risk] || { label: 'Unknown', cls: 'text-slate-600 bg-slate-100' };
    return (
      <div className={`text-center p-2 rounded-lg ${isWinner ? 'bg-teal-50' : 'bg-slate-50'}`}>
        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
      </div>
    );
  };

  // Overall winner
  const scoreWinA = [
    scoresA.overall > scoresB.overall,
    scoresA.safety > scoresB.safety,
    scoresA.sustainability > scoresB.sustainability,
    (productA.hazards?.length || 0) < (productB.hazards?.length || 0),
  ].filter(Boolean).length;
  const scoreWinB = 4 - scoreWinA;
  const overallWinner = scoreWinA > scoreWinB ? 'A' : scoreWinA < scoreWinB ? 'B' : null;

  return (
    <div className="space-y-4">
      {/* Winner banner */}
      {overallWinner && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl text-center shadow-lg">
          <Trophy className="w-6 h-6 mx-auto mb-1" />
          <p className="font-bold text-lg">
            {overallWinner === 'A' ? productA.name : productB.name}
          </p>
          <p className="text-sm opacity-90">is the better choice overall</p>
        </motion.div>
      )}
      {!overallWinner && (
        <div className="p-4 bg-slate-100 rounded-2xl text-center">
          <p className="font-semibold text-slate-600">These products are very similar overall</p>
        </div>
      )}

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-700">Side-by-Side Comparison</CardTitle>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 pt-2">
            <p className="text-xs font-bold text-center text-teal-700 truncate px-1">{productA.name}</p>
            <p className="text-xs text-slate-400 text-center w-20">vs</p>
            <p className="text-xs font-bold text-center text-violet-700 truncate px-1">{productB.name}</p>
          </div>
        </CardHeader>
        <CardContent>
          <CompareRow
            label="Overall Score"
            valueA={scoresA.overall}
            valueB={scoresB.overall}
            renderCell={ScoreCell}
            winner={win(scoresA.overall, scoresB.overall)}
          />
          <CompareRow
            label="Safety Score"
            valueA={scoresA.safety}
            valueB={scoresB.safety}
            renderCell={ScoreCell}
            winner={win(scoresA.safety, scoresB.safety)}
          />
          <CompareRow
            label="Eco Score"
            valueA={scoresA.sustainability}
            valueB={scoresB.sustainability}
            renderCell={ScoreCell}
            winner={win(scoresA.sustainability, scoresB.sustainability)}
          />
          <CompareRow
            label="Hazards"
            valueA={productA.hazards?.length || 0}
            valueB={productB.hazards?.length || 0}
            renderCell={HazardCell}
            winner={win(productA.hazards?.length || 0, productB.hazards?.length || 0, true)}
          />
          <CompareRow
            label="Ingredients"
            valueA={productA.ingredients?.length || 0}
            valueB={productB.ingredients?.length || 0}
            renderCell={IngredientCell}
            winner="tie"
          />
          <CompareRow
            label="Risk Level"
            valueA={productA.riskAssessment?.overallRisk || 'unknown'}
            valueB={productB.riskAssessment?.overallRisk || 'unknown'}
            renderCell={RiskCell}
            winner={(() => {
              const order = { low: 3, medium: 2, high: 1, unknown: 0 };
              const a = order[productA.riskAssessment?.overallRisk] || 0;
              const b = order[productB.riskAssessment?.overallRisk] || 0;
              return a === b ? 'tie' : a > b ? 'A' : 'B';
            })()}
          />
        </CardContent>
      </Card>

      {/* Hazard breakdown */}
      {(productA.hazards?.length > 0 || productB.hazards?.length > 0) && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Hazards Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-teal-700 mb-2 truncate">{productA.name}</p>
                {productA.hazards?.length > 0
                  ? productA.hazards.map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600">{h.description}</p>
                      </div>
                    ))
                  : <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> No hazards</p>}
              </div>
              <div>
                <p className="text-xs font-bold text-violet-700 mb-2 truncate">{productB.name}</p>
                {productB.hazards?.length > 0
                  ? productB.hazards.map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600">{h.description}</p>
                      </div>
                    ))
                  : <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> No hazards</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top ingredients comparison */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-700">Top Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-teal-700 mb-2 truncate">{productA.name}</p>
              {productA.ingredients?.slice(0, 5).map((ing, i) => (
                <div key={i} className="flex items-center justify-between mb-1.5 gap-1">
                  <p className="text-xs text-slate-600 truncate flex-1">{ing.name}</p>
                  <span className={`text-[10px] font-bold px-1.5 rounded ${getRatingLabel(ing.safety ?? 50).bg} ${getRatingLabel(ing.safety ?? 50).color} flex-shrink-0`}>
                    {ing.safety ?? 50}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-violet-700 mb-2 truncate">{productB.name}</p>
              {productB.ingredients?.slice(0, 5).map((ing, i) => (
                <div key={i} className="flex items-center justify-between mb-1.5 gap-1">
                  <p className="text-xs text-slate-600 truncate flex-1">{ing.name}</p>
                  <span className={`text-[10px] font-bold px-1.5 rounded ${getRatingLabel(ing.safety ?? 50).bg} ${getRatingLabel(ing.safety ?? 50).color} flex-shrink-0`}>
                    {ing.safety ?? 50}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Past comparisons panel ────────────────────────────────────────────────────
function PastComparisons({ comparisons, onReload, onDelete }) {
  if (!comparisons.length) return null;
  return (
    <Card className="bg-white shadow-sm mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
          <History className="w-4 h-4 text-violet-500" /> Recent Comparisons
          <span className="ml-auto flex items-center gap-1 text-xs font-normal text-teal-600">
            <Cloud className="w-3 h-3" /> Cloud-synced
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {comparisons.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{c.product_a_name}</span>
                <span className="text-[10px] text-slate-400">vs</span>
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{c.product_b_name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {c.winner_name && c.winner_name !== 'Tie' && (
                  <span className="text-[10px] text-teal-600 font-medium flex items-center gap-0.5">
                    <Trophy className="w-2.5 h-2.5" /> {c.winner_name}
                  </span>
                )}
                {c.created_date && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(c.created_date), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2 flex-shrink-0"
              onClick={() => onReload(c)}>
              Reload
            </Button>
            <button onClick={() => onDelete(c.id)}
              className="p-1 rounded text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CompareProducts({ user }) {
  const { openAuthModal } = useContext(AuthContext);
  const [productA, setProductA] = useState(null);
  const [productB, setProductB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');
  const [pastComparisons, setPastComparisons] = useState([]);

  // Load past comparisons from cloud on mount
  useEffect(() => {
    if (!user) return;
    base44.entities.ComparisonHistory.list('-created_date', 10)
      .then(setPastComparisons)
      .catch(() => {});
  }, [user]);

  // Save comparison to cloud when both products are loaded
  useEffect(() => {
    if (!user || !productA || !productB) return;
    const scoresA = computeScores(productA);
    const scoresB = computeScores(productB);
    const wins = [
      scoresA.overall > scoresB.overall,
      scoresA.safety > scoresB.safety,
      scoresA.sustainability > scoresB.sustainability,
      (productA.hazards?.length || 0) < (productB.hazards?.length || 0),
    ].filter(Boolean).length;
    const winnerName = wins > 2 ? productA.name : wins < 2 ? productB.name : 'Tie';

    base44.entities.ComparisonHistory.create({
      product_a_barcode: productA.barcode,
      product_a_name: productA.name,
      product_a_brand: productA.brand,
      product_a_overall_score: scoresA.overall,
      product_a_safety_score: scoresA.safety,
      product_a_eco_score: scoresA.sustainability,
      product_a_hazard_count: productA.hazards?.length || 0,
      product_b_barcode: productB.barcode,
      product_b_name: productB.name,
      product_b_brand: productB.brand,
      product_b_overall_score: scoresB.overall,
      product_b_safety_score: scoresB.safety,
      product_b_eco_score: scoresB.sustainability,
      product_b_hazard_count: productB.hazards?.length || 0,
      winner_name: winnerName,
    }).then(saved => {
      setPastComparisons(prev => [saved, ...prev].slice(0, 10));
    }).catch(() => {});
  }, [productA, productB, user]);

  const lookup = useCallback(async (barcode, slot) => {
    if (!user) { openAuthModal('login'); return; }
    const setLoading = slot === 'A' ? setLoadingA : setLoadingB;
    const setError = slot === 'A' ? setErrorA : setErrorB;
    const setProduct = slot === 'A' ? setProductA : setProductB;

    setLoading(true);
    setError('');
    try {
      const { data } = await base44.functions.invoke('lookupBarcode', { barcode });
      if (data) setProduct(data);
      else throw new Error('No data returned.');
    } catch (e) {
      setError(e.response?.data?.error || 'Could not find product. Please check the barcode.');
    } finally {
      setLoading(false);
    }
  }, [user, openAuthModal]);

  const reset = () => {
    setProductA(null); setProductB(null);
    setErrorA(''); setErrorB('');
  };

  // Re-lookup both barcodes from a past comparison
  const handleReloadComparison = (c) => {
    reset();
    lookup(c.product_a_barcode, 'A');
    lookup(c.product_b_barcode, 'B');
  };

  const handleDeleteComparison = async (id) => {
    try {
      await base44.entities.ComparisonHistory.delete(id);
      setPastComparisons(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800">Compare Products</h2>
        <p className="text-slate-500 mt-2 text-sm">Scan two products to see a side-by-side safety, ingredient, and sustainability comparison.</p>
        {user && (
          <span className="inline-flex items-center gap-1 text-xs text-teal-600 mt-2">
            <Cloud className="w-3 h-3" /> Comparisons synced across your devices
          </span>
        )}
      </div>

      {/* Product slots */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <ProductSlot
          label="Product A"
          product={productA}
          onLookup={(bc) => lookup(bc, 'A')}
          onClear={() => { setProductA(null); setErrorA(''); }}
          isLoading={loadingA}
        />
        <div className="hidden sm:flex items-center flex-shrink-0">
          <ChevronRight className="w-6 h-6 text-slate-300" />
        </div>
        <ProductSlot
          label="Product B"
          product={productB}
          onLookup={(bc) => lookup(bc, 'B')}
          onClear={() => { setProductB(null); setErrorB(''); }}
          isLoading={loadingB}
        />
      </div>

      {errorA && <p className="text-xs text-red-500 text-center mb-1">Product A: {errorA}</p>}
      {errorB && <p className="text-xs text-red-500 text-center mb-2">Product B: {errorB}</p>}

      {/* Comparison table */}
      {productA && productB ? (
        <motion.div key="compare" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ComparisonTable productA={productA} productB={productB} />
          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" /> Compare Different Products
          </Button>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="flex justify-center gap-4 mb-4 opacity-50">
            <div className="w-16 h-20 rounded-xl bg-slate-200" />
            <div className="flex items-center"><ChevronRight className="w-6 h-6" /></div>
            <div className="w-16 h-20 rounded-xl bg-slate-200" />
          </div>
          <p className="text-sm">Enter barcodes for both products to start comparing</p>
        </div>
      )}

      {/* Past comparisons (cloud-synced) */}
      <PastComparisons
        comparisons={pastComparisons}
        onReload={handleReloadComparison}
        onDelete={handleDeleteComparison}
      />
    </div>
  );
}