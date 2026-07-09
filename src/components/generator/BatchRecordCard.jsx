import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Printer, QrCode, Calendar, Package, ShieldCheck, AlertTriangle, DollarSign } from 'lucide-react';

const fmt = (n) => (isFinite(n) ? `$${n.toFixed(2)}` : '$0.00');

function generateBatchNumber() {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `BAT-${dateStr}-${random}`;
}

export default function BatchRecordCard({ formula, batchName, batchSize, batchUnit, quantities, complianceData, lotData, stabilityData, totalCost, expirationDate, batchNumber, onSaveBatch }) {
  const printRef = useRef(null);
  const generatedBatchNumber = batchNumber || generateBatchNumber();

  // QR code URL using public API (encodes batch number)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(generatedBatchNumber)}`;

  const creationDate = new Date().toLocaleDateString();

  const handlePrint = () => {
    const printContent = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Batch Record - ${generatedBatchNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #02988C; padding-bottom: 12px; margin-bottom: 20px; }
            .batch-number { font-size: 20px; font-weight: bold; color: #02988C; }
            .section { margin-bottom: 16px; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; padding: 6px 8px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
            td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .badge-compliant { background: #d1fae5; color: #065f46; }
            .badge-restricted { background: #fef3c7; color: #92400e; }
            .badge-noncompliant { background: #fee2e2; color: #991b1b; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
            .qr { text-align: center; }
            .qr img { width: 100px; height: 100px; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const overallRisk = complianceData?.overall_risk || 'unknown';
  const riskClass = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
    unknown: 'bg-slate-100 text-slate-600',
  };

  return (
    <Card className="border-2 border-teal-200" ref={printRef}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Batch Record
            </CardTitle>
            <p className="text-xl font-bold text-teal-700 mt-1">{generatedBatchNumber}</p>
          </div>
          <div className="qr text-center">
            <img src={qrCodeUrl} alt="Batch QR Code" className="w-24 h-24" />
            <p className="text-[9px] text-slate-400 mt-1">Scan for traceability</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="info-row">
            <span className="text-slate-500">Batch Name:</span>
            <span className="font-medium text-slate-800">{batchName || formula.name || 'Untitled'}</span>
          </div>
          <div className="info-row">
            <span className="text-slate-500">Date Created:</span>
            <span className="font-medium text-slate-800">{creationDate}</span>
          </div>
          <div className="info-row">
            <span className="text-slate-500">Batch Size:</span>
            <span className="font-medium text-slate-800">{batchSize} {batchUnit}</span>
          </div>
          <div className="info-row">
            <span className="text-slate-500">Formula:</span>
            <span className="font-medium text-slate-800 truncate ml-2">{formula.name || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="text-slate-500">Expiration:</span>
            <span className="font-medium text-slate-800">{expirationDate || `${stabilityData?.months || 12} months from creation`}</span>
          </div>
          <div className="info-row">
            <span className="text-slate-500">Total Cost:</span>
            <span className="font-bold text-teal-700">{fmt(totalCost || 0)}</span>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="section">
          <div className="section-title flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Compliance Summary
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge className={`text-xs ${riskClass[overallRisk]}`}>
              Risk: {overallRisk}
            </Badge>
            {complianceData?.regional_compliance?.map((r, i) => (
              <Badge key={i} className={`text-[10px] ${r.status === 'compliant' ? 'bg-emerald-100 text-emerald-700' : r.status === 'restricted' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                {r.region}: {r.status}
              </Badge>
            ))}
            {complianceData?.allergen_declarations?.length > 0 && (
              <Badge className="text-[10px] bg-orange-100 text-orange-700">
                {complianceData.allergen_declarations.length} allergen(s)
              </Badge>
            )}
          </div>
          {complianceData?.risk_summary && (
            <p className="text-xs text-slate-500 mt-2">{complianceData.risk_summary}</p>
          )}
        </div>

        {/* Ingredient Table with Lots */}
        <div className="section">
          <div className="section-title flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> Ingredients & Lot Tracking
          </div>
          <table className="w-full text-xs mt-2">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-1.5 pr-2 text-slate-500">Ingredient</th>
                <th className="text-right py-1.5 px-2 text-slate-500">%</th>
                <th className="text-right py-1.5 px-2 text-slate-500">Qty</th>
                <th className="text-left py-1.5 px-2 text-slate-500">Supplier</th>
                <th className="text-left py-1.5 pl-2 text-slate-500">Lot #</th>
              </tr>
            </thead>
            <tbody>
              {(formula.ingredients || []).map((ing, i) => {
                const qty = quantities?.[i];
                const lot = lotData?.[ing.chemical_name] || {};
                return (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2 font-medium text-slate-800">{ing.chemical_name}</td>
                    <td className="text-right py-1.5 px-2 text-slate-600">{ing.percentage}%</td>
                    <td className="text-right py-1.5 px-2 text-teal-700 font-medium">{qty?.grams || '-'}g</td>
                    <td className="py-1.5 px-2 text-slate-600">{lot.supplier || '--'}</td>
                    <td className="py-1.5 pl-2 text-slate-600">{lot.lot_number || '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Stability & Labeling Notes */}
        <div className="section">
          <div className="section-title">Stability & Labeling Notes</div>
          <div className="space-y-1 mt-2 text-xs text-slate-600">
            <p><strong>Predicted Shelf Life:</strong> {stabilityData?.months || 12} months</p>
            <p><strong>Stability Summary:</strong> {stabilityData?.summary || 'Standard stability expected'}</p>
            {complianceData?.labeling_requirements?.slice(0, 3).map((req, i) => (
              <p key={i} className="flex items-start gap-1">
                <AlertTriangle className="w-2.5 h-2.5 mt-0.5 text-amber-500 flex-shrink-0" /> {req}
              </p>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Button size="sm" variant="outline" className="text-xs" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1" /> Print / PDF
          </Button>
          {onSaveBatch && (
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs" onClick={() => onSaveBatch(generatedBatchNumber)}>
              <FileText className="w-3.5 h-3.5 mr-1" /> Save Batch Record
            </Button>
          )}
        </div>

        <div className="footer">
          Generated by Suttain Formula Generator | {generatedBatchNumber} | {creationDate}
        </div>
      </CardContent>
    </Card>
  );
}