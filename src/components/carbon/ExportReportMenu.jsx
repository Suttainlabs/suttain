import React from 'react';
import jsPDF from 'jspdf';
import { Download, FileText, FileSpreadsheet, FileType2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ExportReportMenu({
  ingredients,
  totalBatchCO2e,
  annualCO2eTonnes,
  taxExposureKPI,
  carbonPrice,
  unitsPerMonth,
  taxScenarios,
  alternatives,
}) {
  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildSections = () => {
    const totalLow = taxScenarios.reduce((s, r) => s + r.low, 0);
    const totalBase = taxScenarios.reduce((s, r) => s + r.base, 0);
    const totalHigh = taxScenarios.reduce((s, r) => s + r.high, 0);
    return { totalLow, totalBase, totalHigh };
  };

  // ── TXT ──
  const exportTXT = () => {
    const { totalLow, totalBase, totalHigh } = buildSections();
    const lines = [
      'SUTTAIN: CARBON TAX & OPPORTUNITY REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      '--- INGREDIENT FOOTPRINT ---',
      ...ingredients.map((i) => `${i.name}: ${i.quantity_kg}kg x ${i.carbon_intensity} = ${(i.quantity_kg * i.carbon_intensity).toFixed(2)} kg CO2e`),
      `Total batch CO2e: ${totalBatchCO2e.toFixed(2)} kg`,
      `Annual CO2e: ${annualCO2eTonnes.toFixed(1)} tonnes`,
      `Quick-estimate tax exposure: $${taxExposureKPI.toLocaleString()}/yr at $${carbonPrice}/tonne`,
      '',
    ];
    if (taxScenarios.length) {
      lines.push('--- PER-MARKET TAX SCENARIOS ---');
      lines.push(`Combined (all selected markets): Low $${totalLow.toFixed(0)} / Base $${totalBase.toFixed(0)} / High $${totalHigh.toFixed(0)}`);
      lines.push('');
      taxScenarios.forEach((r) => {
        lines.push(`${r.name} (${r.regulation_name}): Low $${r.low.toFixed(0)} / Base $${r.base.toFixed(0)} / High $${r.high.toFixed(0)}`);
        if (r.cbam_exposure > 0) lines.push(`  CBAM exposure (forward-looking): $${r.cbam_exposure.toFixed(0)}/yr at ${r.cbam_phase_in_pct}% phase-in`);
      });
      lines.push('');
    }
    if (alternatives) {
      lines.push('--- GREEN ALTERNATIVES ---');
      alternatives.alternatives?.forEach((a, i) => {
        lines.push(`${i + 1}. Replace ${a.replace_ingredient} with ${a.alternative_ingredient}, ${a.carbon_reduction_pct}% less CO2e, $${a.cost_saving_1yr}/yr savings`);
      });
      lines.push('');
      if (alternatives.summary) lines.push(alternatives.summary);
    }
    download(new Blob([lines.join('\n')], { type: 'text/plain' }), 'suttain_carbon_report.txt');
  };

  // ── PDF ──
  const exportPDF = () => {
    const { totalLow, totalBase, totalHigh } = buildSections();
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.setTextColor(10, 31, 29);
    doc.text('SUTTAIN: Carbon Tax & Opportunity Report', pageW / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW / 2, y, { align: 'center' });
    y += 10;

    const section = (title) => {
      y += 4;
      doc.setFontSize(11);
      doc.setTextColor(2, 152, 140);
      doc.text(title, 14, y);
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(60);
    };

    const row = (text, indent = 14) => {
      const lines = doc.splitTextToSize(text, pageW - indent - 14);
      lines.forEach((ln) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(ln, indent, y);
        y += 5;
      });
    };

    section('Ingredient Footprint');
    ingredients.forEach((i) => row(`${i.name}: ${i.quantity_kg}kg x ${i.carbon_intensity} = ${(i.quantity_kg * i.carbon_intensity).toFixed(2)} kg CO2e`));
    row(`Total batch CO2e: ${totalBatchCO2e.toFixed(2)} kg`);
    row(`Annual CO2e: ${annualCO2eTonnes.toFixed(1)} tonnes`);
    row(`Quick-estimate tax exposure: $${taxExposureKPI.toLocaleString()}/yr at $${carbonPrice}/tonne`);

    if (taxScenarios.length) {
      section('Per-Market Tax Scenarios');
      row(`Combined (all selected markets): Low $${totalLow.toFixed(0)} / Base $${totalBase.toFixed(0)} / High $${totalHigh.toFixed(0)}`);
      taxScenarios.forEach((r) => {
        row(`${r.name} (${r.regulation_name}): Low $${r.low.toFixed(0)} / Base $${r.base.toFixed(0)} / High $${r.high.toFixed(0)}`);
        if (r.cbam_exposure > 0) row(`  CBAM exposure (forward-looking): $${r.cbam_exposure.toFixed(0)}/yr at ${r.cbam_phase_in_pct}% phase-in`);
      });
    }

    if (alternatives) {
      section('Green Alternatives');
      alternatives.alternatives?.forEach((a, i) => {
        row(`${i + 1}. Replace ${a.replace_ingredient} with ${a.alternative_ingredient}, ${a.carbon_reduction_pct}% less CO2e, $${a.cost_saving_1yr}/yr savings`);
      });
      if (alternatives.summary) row(alternatives.summary);
    }

    doc.save('suttain_carbon_report.pdf');
  };

  // ── Excel (CSV, opens natively in Excel) ──
  const exportExcel = () => {
    const { totalLow, totalBase, totalHigh } = buildSections();
    const rows = [
      ['SUTTAIN: Carbon Tax & Opportunity Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ['Ingredient', 'Quantity (kg)', 'Carbon Intensity', 'CO2e (kg)'],
      ...ingredients.map((i) => [i.name, i.quantity_kg, i.carbon_intensity, (i.quantity_kg * i.carbon_intensity).toFixed(2)]),
      [],
      ['Total batch CO2e (kg)', totalBatchCO2e.toFixed(2)],
      ['Annual CO2e (tonnes)', annualCO2eTonnes.toFixed(1)],
      ['Quick-estimate tax exposure ($/yr)', taxExposureKPI.toLocaleString()],
      ['Carbon price ($/tonne)', carbonPrice],
      ['Units per month', unitsPerMonth],
    ];

    if (taxScenarios.length) {
      rows.push([]);
      rows.push(['Per-Market Tax Scenarios']);
      rows.push(['Market', 'Regulation', 'Low ($/yr)', 'Base ($/yr)', 'High ($/yr)', 'CBAM ($/yr)', 'Price Low', 'Price Base', 'Price High']);
      taxScenarios.forEach((r) => {
        rows.push([r.name, r.regulation_name, r.low.toFixed(0), r.base.toFixed(0), r.high.toFixed(0), r.cbam_exposure.toFixed(0), r.price_low, r.price_base, r.price_high]);
      });
      rows.push(['Combined', '', totalLow.toFixed(0), totalBase.toFixed(0), totalHigh.toFixed(0), '', '', '', '']);
    }

    if (alternatives) {
      rows.push([]);
      rows.push(['Green Alternatives']);
      rows.push(['#', 'Replace', 'With', 'CO2e Reduction (%)', 'Annual Savings ($)', 'Eco-Score Gain', 'Difficulty']);
      alternatives.alternatives?.forEach((a, i) => {
        rows.push([i + 1, a.replace_ingredient, a.alternative_ingredient, a.carbon_reduction_pct, a.cost_saving_1yr, a.eco_score_gain || '', a.difficulty || '']);
      });
      if (alternatives.summary) rows.push([], ['Summary', alternatives.summary]);
    }

    const csv = rows.map((r) => r.map((c) => {
      const s = String(c ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')).join('\n');

    download(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), 'suttain_carbon_report.csv');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={exportPDF} className="cursor-pointer">
          <FileType2 className="w-4 h-4 mr-2 text-red-500" /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportTXT} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2 text-slate-500" /> TXT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}