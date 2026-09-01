import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { chemicalInteractionScore } from '@/functions/chemicalInteractionScore';
import { Atom, Loader2, FileDown, FlaskConical, Grid3x3 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import FormulaInputPanel from '@/components/interaction/FormulaInputPanel';
import MoleculeViewer3D from '@/components/interaction/MoleculeViewer3D';
import InteractionHeatmap from '@/components/interaction/InteractionHeatmap';
import ShelfLifePredictor from '@/components/interaction/ShelfLifePredictor';
import WarningsBanner from '@/components/interaction/WarningsBanner';
import StabilityScoreBadge from '@/components/interaction/StabilityScoreBadge';

export default function InteractionVisualization() {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (ingredients.length < 2) return;
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const res = await chemicalInteractionScore({ ingredients, ph: 5.5 });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      setAnalysisResult(data);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to analyze interactions. Please try again.');
      toast({ title: 'Analysis failed', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleExportPDF = async () => {
    if (!analysisResult) return;
    toast({ title: 'Generating PDF report...' });

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;

      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(2, 152, 140);
      pdf.text('Stability Interaction Report', 20, y);
      y += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
      y += 12;

      // Formula Composition
      pdf.setFontSize(13);
      pdf.setTextColor(30);
      pdf.text('Formula Composition', 20, y);
      y += 7;
      pdf.setFontSize(9);
      ingredients.forEach((ing, i) => {
        pdf.text(`${i + 1}. ${ing.name}, ${ing.percentage}%`, 25, y);
        y += 6;
      });
      y += 6;

      // Stability Score
      pdf.setFontSize(13);
      pdf.text(`Stability Score: ${Math.round(analysisResult.overall_stability_score || 0)}/100`, 20, y);
      y += 7;
      pdf.setFontSize(9);
      pdf.text(`Base Shelf Life: ${analysisResult.base_shelf_life_months || 'N/A'} months at room temperature`, 20, y);
      y += 6;
      pdf.text(`Degradation Rate: ${analysisResult.degradation_rate || 'N/A'}%/month (room temp)`, 20, y);
      y += 10;

      // Warnings
      if (analysisResult.warnings?.length > 0) {
        pdf.setFontSize(13);
        pdf.setTextColor(200, 43, 43);
        pdf.text(`Warnings (${analysisResult.warnings.length})`, 20, y);
        y += 7;
        pdf.setFontSize(9);
        pdf.setTextColor(80);
        analysisResult.warnings.forEach((w) => {
          const text = `[${w.severity.toUpperCase()}] ${w.ingredient_pair}: ${w.message}`;
          const lines = pdf.splitTextToSize(text, pageWidth - 40);
          lines.forEach(line => {
            if (y > 270) { pdf.addPage(); y = 20; }
            pdf.text(line, 25, y);
            y += 5;
          });
          y += 2;
        });
      }

      // Interaction Matrix
      pdf.addPage();
      y = 20;
      pdf.setFontSize(13);
      pdf.setTextColor(30);
      pdf.text('Interaction Matrix', 20, y);
      y += 8;
      pdf.setFontSize(8);
      if (analysisResult.interaction_matrix?.length > 0) {
        analysisResult.interaction_matrix.forEach((pair) => {
          if (y > 270) { pdf.addPage(); y = 20; }
          pdf.text(`${pair.ingredient_a} + ${pair.ingredient_b}: ${pair.score}/100`, 25, y);
          y += 5;
          const expl = pdf.splitTextToSize(`Explanation: ${pair.explanation}`, pageWidth - 50);
          pdf.setTextColor(100);
          expl.forEach(line => { pdf.text(line, 30, y); y += 4; });
          pdf.setTextColor(30);
          y += 3;
        });
      }

      // Heatmap image
      const heatmapEl = document.getElementById('heatmap-capture');
      if (heatmapEl) {
        pdf.addPage();
        y = 20;
        pdf.setFontSize(13);
        pdf.text('Interaction Heatmap (Visual)', 20, y);
        y += 5;
        const canvas = await html2canvas(heatmapEl, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        pdf.addImage(imgData, 'PNG', 20, y, imgWidth, Math.min(imgHeight, 250));
      }

      // Storage Recommendations
      pdf.addPage();
      y = 20;
      pdf.setFontSize(13);
      pdf.text('Storage Recommendations', 20, y);
      y += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(80);
      const recs = analysisResult.storage_recommendations || 'No specific recommendations available.';
      const recLines = pdf.splitTextToSize(recs, pageWidth - 40);
      recLines.forEach(line => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.text(line, 25, y);
        y += 5;
      });

      pdf.save('stability-interaction-report.pdf');
      toast({ title: 'PDF report downloaded' });
    } catch (err) {
      console.error('PDF export failed:', err);
      toast({ title: 'PDF export failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content-container space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Atom className="w-6 h-6 text-teal-600" />
              Chemical Interaction Visualization
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Analyze pairwise ingredient interactions, 3D molecular structures, shelf-life stability, and export a full report
            </p>
          </div>
          {analysisResult && (
            <Button onClick={handleExportPDF} className="bg-teal-600 hover:bg-teal-700 text-white">
              <FileDown className="w-4 h-4 mr-1" /> Export Stability Report
            </Button>
          )}
        </div>

        {/* Warnings */}
        {analysisResult?.warnings?.length > 0 && (
          <WarningsBanner warnings={analysisResult.warnings} />
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={handleAnalyze}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Formula Input */}
        <FormulaInputPanel
          ingredients={ingredients}
          onIngredientsChange={setIngredients}
          onAnalyze={handleAnalyze}
          loading={loading}
        />

        {/* Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Stability Score */}
            <StabilityScoreBadge score={analysisResult.overall_stability_score} />

            {/* 3D Molecule Viewers */}
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Atom className="w-5 h-5 text-teal-600" /> 3D Molecular Structures
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ingredients.map((ing, idx) => (
                  <MoleculeViewer3D key={`${ing.name}-${idx}`} ingredientName={ing.name} index={idx} />
                ))}
              </div>
            </div>

            {/* Interaction Heatmap */}
            <div id="heatmap-capture">
              <InteractionHeatmap matrix={analysisResult.interaction_matrix} ingredients={ingredients} />
            </div>

            {/* Shelf-Life Predictor */}
            <ShelfLifePredictor
              degradationRate={analysisResult.degradation_rate}
              baseShelfLifeMonths={analysisResult.base_shelf_life_months}
              criticalPoints={analysisResult.critical_degradation_points}
              storageRecommendations={analysisResult.storage_recommendations}
            />
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !loading && !error && (
          <Card className="border-dashed border-slate-300">
            <CardContent className="p-8 text-center">
              <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Add ingredients and run analysis</p>
              <p className="text-xs text-slate-400 mt-1">
                Results will show 3D structures, interaction heatmap, shelf-life timeline, and stability score
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}