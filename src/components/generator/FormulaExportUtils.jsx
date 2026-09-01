import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, FileText, Table, Loader2, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";

function generateCSV(formula) {
  const rows = [
    ["Formula Name", formula.name || "Untitled Formula"],
    ["Description", formula.description || ""],
    ["Product Type", (formula.product_type || "").replace(/_/g, " ")],
    ["pH Level", formula.properties?.ph_level || "N/A"],
    ["Shelf Life", formula.properties?.shelf_life || "N/A"],
    ["Difficulty", formula.properties?.difficulty || "N/A"],
    ["Time to Make", formula.properties?.time_to_make || "N/A"],
    [],
    ["Ingredient", "Percentage (%)", "Purpose"],
  ];

  (formula.ingredients || []).forEach((ing) => {
    rows.push([
      ing.chemical_name || "",
      String(ing.percentage ?? ""),
      ing.purpose || "",
    ]);
  });

  const total = (formula.ingredients || []).reduce(
    (sum, ing) => sum + (parseFloat(ing.percentage) || 0),
    0
  );
  rows.push(["TOTAL", total.toFixed(2), ""]);

  if (formula.safety_precautions?.length) {
    rows.push([], ["Safety Precautions"]);
    formula.safety_precautions.forEach((p) => rows.push([p]));
  }

  let instructions = formula.instructions;
  if (typeof instructions === "string") {
    try { instructions = JSON.parse(instructions); } catch { instructions = []; }
  }
  if (Array.isArray(instructions) && instructions.length) {
    rows.push([], ["Mixing Instructions"]);
    instructions.forEach((phase) => {
      rows.push([`Phase: ${phase.phase}`]);
      (phase.steps || []).forEach((step, i) => rows.push([`  ${i + 1}. ${step}`]));
    });
  }

  const escape = (val) => {
    const s = String(val ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  return rows.map((r) => r.map(escape).join(",")).join("\n");
}

function generatePDF(formula) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addText = (text, size, style, color, maxWidth) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    if (color) doc.setTextColor(...color);
    else doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(text, maxWidth || pageWidth - 40);
    lines.forEach((line) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += size * 0.5 + 1;
    });
  };

  const addSpacer = (h = 6) => { y += h; };

  // Header bar
  doc.setFillColor(2, 152, 140);
  doc.rect(0, 0, pageWidth, 12, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("SUTTAIN: Chemical Safety & Formulation Platform", 20, 8);
  y = 24;

  // Title
  addText(formula.name || "Untitled Formula", 20, "bold");
  addSpacer(2);
  if (formula.description) {
    addText(formula.description, 10, "normal", [100, 116, 139]);
    addSpacer(4);
  }

  // Properties row
  const props = [
    { label: "pH", value: formula.properties?.ph_level },
    { label: "Shelf Life", value: formula.properties?.shelf_life },
    { label: "Difficulty", value: formula.properties?.difficulty },
    { label: "Time", value: formula.properties?.time_to_make },
  ].filter((p) => p.value);

  if (props.length) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, y, pageWidth - 40, 12, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const colW = (pageWidth - 40) / props.length;
    props.forEach((p, i) => {
      doc.text(`${p.label}: ${p.value}`, 24 + i * colW, y + 7.5);
    });
    y += 18;
  }

  // Ingredients table
  addText("Ingredients", 13, "bold", [2, 152, 140]);
  addSpacer(2);

  // Table header
  doc.setFillColor(2, 152, 140);
  doc.rect(20, y, pageWidth - 40, 8, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Ingredient", 24, y + 5.5);
  doc.text("%", 120, y + 5.5);
  doc.text("Purpose", 140, y + 5.5);
  y += 10;

  doc.setFont("helvetica", "normal");
  (formula.ingredients || []).forEach((ing, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const bgColor = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
    doc.setFillColor(...bgColor);
    doc.rect(20, y - 2, pageWidth - 40, 7, "F");
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.text(String(ing.chemical_name || ""), 24, y + 3);
    doc.text(String(ing.percentage ?? ""), 120, y + 3);
    const purposeLines = doc.splitTextToSize(String(ing.purpose || ""), 45);
    doc.text(purposeLines[0] || "", 140, y + 3);
    y += 7;
  });

  // Total
  const total = (formula.ingredients || []).reduce(
    (s, i) => s + (parseFloat(i.percentage) || 0), 0
  );
  doc.setFont("helvetica", "bold");
  doc.setFillColor(241, 245, 249);
  doc.rect(20, y - 2, pageWidth - 40, 7, "F");
  doc.setTextColor(30, 41, 59);
  doc.text("TOTAL", 24, y + 3);
  doc.text(`${total.toFixed(2)}%`, 120, y + 3);
  y += 12;

  // Instructions
  let instructions = formula.instructions;
  if (typeof instructions === "string") {
    try { instructions = JSON.parse(instructions); } catch { instructions = []; }
  }
  if (Array.isArray(instructions) && instructions.length) {
    addText("Mixing Instructions", 13, "bold", [2, 152, 140]);
    addSpacer(2);
    instructions.forEach((phase) => {
      addText(phase.phase, 10, "bold");
      (phase.steps || []).forEach((step, i) => {
        addText(`${i + 1}. ${step}`, 9, "normal", [71, 85, 105], pageWidth - 50);
        addSpacer(1);
      });
      addSpacer(3);
    });
  }

  // Safety
  if (formula.safety_precautions?.length) {
    addText("Safety Precautions", 13, "bold", [2, 152, 140]);
    addSpacer(2);
    formula.safety_precautions.forEach((p) => {
      addText(`• ${p}`, 9, "normal", [71, 85, 105], pageWidth - 50);
      addSpacer(1);
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated by Suttain: Page ${i} of ${pageCount} : ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  return doc;
}

export default function FormulaExportDialog({ isOpen, onClose, formula }) {
  const [exporting, setExporting] = useState(null);
  const [done, setDone] = useState(null);

  const handleExportPDF = () => {
    setExporting("pdf");
    setTimeout(() => {
      const doc = generatePDF(formula);
      const filename = `${(formula.name || "formula").replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
      setExporting(null);
      setDone("pdf");
      setTimeout(() => setDone(null), 2000);
    }, 100);
  };

  const handleExportCSV = () => {
    setExporting("csv");
    setTimeout(() => {
      const csv = generateCSV(formula);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(formula.name || "formula").replace(/\s+/g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(null);
      setDone("csv");
      setTimeout(() => setDone(null), 2000);
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-suttain-teal" />
            Export Formula
          </DialogTitle>
          <DialogDescription>
            Download your formula for professional use and documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* PDF Option */}
          <button
            onClick={handleExportPDF}
            disabled={!!exporting}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-suttain-teal/40 hover:bg-suttain-teal/5 transition-all text-left group disabled:opacity-60"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
              {exporting === "pdf" ? (
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              ) : done === "pdf" ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <FileText className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">Export as PDF</p>
              <p className="text-xs text-slate-500">
                Professional document with ingredients, instructions, and safety info
              </p>
            </div>
          </button>

          {/* CSV Option */}
          <button
            onClick={handleExportCSV}
            disabled={!!exporting}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-suttain-teal/40 hover:bg-suttain-teal/5 transition-all text-left group disabled:opacity-60"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
              {exporting === "csv" ? (
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              ) : done === "csv" ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Table className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">Export as CSV</p>
              <p className="text-xs text-slate-500">
                Spreadsheet-ready data for analysis, costing, or inventory management
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}