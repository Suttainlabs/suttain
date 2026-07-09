import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Boxes } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BatchScalingPanel from './BatchScalingPanel';
import BatchCompliancePanel from './BatchCompliancePanel';
import LotTrackingPanel from './LotTrackingPanel';
import StabilityPredictionPanel from './StabilityPredictionPanel';
import BatchRecordCard from './BatchRecordCard';

export default function BatchManagementPanel({ formula, batchSize, batchUnit }) {
  const { toast } = useToast();
  const [activeBatchSize, setActiveBatchSize] = useState(batchSize || 100);
  const [activeBatchUnit, setActiveBatchUnit] = useState(batchUnit || 'g');
  const [quantities, setQuantities] = useState([]);
  const [batchGrams, setBatchGrams] = useState(0);
  const [concentrationWarnings, setConcentrationWarnings] = useState([]);
  const [complianceData, setComplianceData] = useState(null);
  const [lotData, setLotData] = useState({});
  const [earliestExpiration, setEarliestExpiration] = useState(null);
  const [lotAlerts, setLotAlerts] = useState([]);
  const [stabilityData, setStabilityData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleBatchChange = useCallback((size, unit) => {
    setActiveBatchSize(size);
    setActiveBatchUnit(unit);
  }, []);

  const handleQuantitiesCalculated = useCallback((qtys, grams) => {
    setQuantities(qtys);
    setBatchGrams(grams);
  }, []);

  const handleWarningsUpdate = useCallback((warnings) => {
    setConcentrationWarnings(warnings);
  }, []);

  const handleComplianceResult = useCallback((data) => {
    setComplianceData(data);
  }, []);

  const handleLotsUpdate = useCallback((lots, earliest, alerts) => {
    setLotData(lots);
    setEarliestExpiration(earliest);
    setLotAlerts(alerts);
  }, []);

  const handleStabilityResult = useCallback((data) => {
    setStabilityData(data);
  }, []);

  // Calculate total batch cost from quantities + costing_data if available
  const totalBatchCost = useMemo(() => {
    const costingData = formula.costing_data;
    if (!costingData?.ingredientCosts) return 0;
    return quantities.reduce((sum, q) => {
      const costEntry = costingData.ingredientCosts[q.name] || {};
      const price = parseFloat(costEntry.price) || 0;
      const unitGrams = parseFloat(costEntry.unit) || 100;
      const gramsNeeded = batchGrams * ((parseFloat(q.percentage) || 0) / 100);
      return sum + (price / unitGrams) * gramsNeeded;
    }, 0);
  }, [quantities, formula.costing_data, batchGrams]);

  const handleSaveBatch = async (batchNumber) => {
    if (!formula.id) {
      toast({ title: 'Save formula first', description: 'Please save the formula before creating a batch record.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const expirationDate = earliestExpiration ||
        new Date(Date.now() + (stabilityData?.months || 12) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const ingredientLots = Object.entries(lotData)
        .filter(([_, lot]) => lot.lot_number)
        .map(([ingredientName, lot]) => ({
          ingredient_name: ingredientName,
          supplier: lot.supplier || '',
          lot_number: lot.lot_number,
          expiration_date: lot.expiration_date || null,
        }));

      await base44.entities.BatchRecord.create({
        batch_number: batchNumber,
        batch_name: formula.name || 'Untitled Batch',
        formula_id: formula.id,
        formula_name: formula.name || '',
        batch_size: activeBatchSize,
        batch_unit: activeBatchUnit,
        status: 'draft',
        ingredient_lots: ingredientLots,
        compliance_data: complianceData || {},
        predicted_shelf_life_months: stabilityData?.months || 12,
        expiration_date: expirationDate,
        stability_factors: stabilityData || {},
        concentration_warnings: concentrationWarnings.map((w) => ({
          ingredient: w.name,
          current_percentage: w.percentage,
          safe_range: w.safeRange ? `${w.safeRange.min}-${w.safeRange.max}${w.safeRange.unit}` : 'N/A',
          warning: w.warning,
        })),
        total_batch_cost: totalBatchCost,
      });

      toast({ title: 'Batch record saved', description: `Batch ${batchNumber} saved successfully.` });
    } catch (error) {
      console.error('Failed to save batch:', error);
      toast({ title: 'Save failed', description: error.message || 'Could not save batch record.', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <Boxes className="w-5 h-5 text-teal-600" />
        <h3 className="text-base font-semibold text-slate-800">Batch Management & Traceability</h3>
      </div>

      {/* 1. Batch Scaling */}
      <BatchScalingPanel
        formula={formula}
        batchSize={activeBatchSize}
        batchUnit={activeBatchUnit}
        onBatchChange={handleBatchChange}
        onQuantitiesCalculated={handleQuantitiesCalculated}
        onWarningsUpdate={handleWarningsUpdate}
      />

      {/* 2. Compliance Check */}
      <BatchCompliancePanel
        formula={formula}
        batchSize={activeBatchSize}
        batchUnit={activeBatchUnit}
        onComplianceResult={handleComplianceResult}
      />

      {/* 3. Lot Tracking */}
      <LotTrackingPanel
        formula={formula}
        batchSize={activeBatchSize}
        batchUnit={activeBatchUnit}
        onLotsUpdate={handleLotsUpdate}
      />

      {/* 4. Stability Prediction */}
      <StabilityPredictionPanel
        formula={formula}
        onStabilityResult={handleStabilityResult}
      />

      {/* 5. Batch Record Card (printable) */}
      <BatchRecordCard
        formula={formula}
        batchName={formula.name}
        batchSize={activeBatchSize}
        batchUnit={activeBatchUnit}
        quantities={quantities}
        complianceData={complianceData}
        lotData={lotData}
        stabilityData={stabilityData}
        totalCost={totalBatchCost}
        expirationDate={earliestExpiration}
        onSaveBatch={handleSaveBatch}
      />
    </div>
  );
}