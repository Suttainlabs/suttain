import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Loader2, FileBox, ArrowRight, Boxes, Atom, Info } from "lucide-react";

const FORMATS = ["xyz", "poscar", "cif", "pdb"];

const BUILD_TYPES = [
  { value: "sc", label: "Simple Cubic", desc: "1 atom per cell" },
  { value: "bcc", label: "Body-Centered Cubic (BCC)", desc: "2 atoms per cell" },
  { value: "fcc", label: "Face-Centered Cubic (FCC)", desc: "4 atoms per cell" },
  { value: "diamond", label: "Diamond Cubic", desc: "8 atoms per cell (Si, Ge)" },
  { value: "nacl", label: "NaCl (Rock Salt)", desc: "8 atoms per cell" },
];

export default function StructureBuilder({ onStructureLoaded }) {
  const [mode, setMode] = useState("upload");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [formatIn, setFormatIn] = useState("auto");
  const [formatOut, setFormatOut] = useState("xyz");
  const [output, setOutput] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);
  const [buildType, setBuildType] = useState("diamond");
  const [latticeConstant, setLatticeConstant] = useState("5.43");
  const [buildElement, setBuildElement] = useState("Si");
  const [buildElement2, setBuildElement2] = useState("Cl");
  const fileRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileContent(ev.target.result);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleParse = async () => {
    if (!fileContent) return;
    setLoadingAction("parse");
    setError(null);
    try {
      const res = await base44.functions.invoke("structureTools", {
        action: "parse",
        file_content: fileContent,
        format_in: formatIn === "auto" ? null : formatIn,
      });
      const result = res.data;
      setOutput(result);
      if (onStructureLoaded) onStructureLoaded(result);
    } catch (e) {
      setError(e.message || "Failed to parse structure");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConvert = async () => {
    if (!fileContent) return;
    setLoadingAction("convert");
    setError(null);
    try {
      const res = await base44.functions.invoke("structureTools", {
        action: "convert",
        file_content: fileContent,
        format_in: formatIn === "auto" ? null : formatIn,
        format_out: formatOut,
      });
      setOutput(res.data);
    } catch (e) {
      setError(e.message || "Failed to convert structure");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuild = async () => {
    setLoadingAction("build");
    setError(null);
    try {
      const elements = buildType === "nacl" ? [buildElement, buildElement2] : [buildElement];
      const res = await base44.functions.invoke("structureTools", {
        action: "build",
        build_params: {
          structure_type: buildType,
          lattice_constant: parseFloat(latticeConstant),
          elements,
        },
      });
      const result = res.data;
      setOutput(result);
      if (onStructureLoaded) onStructureLoaded(result);
    } catch (e) {
      setError(e.message || "Failed to build structure");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownload = () => {
    if (!output?.output_content) return;
    const ext = output.output_format === "poscar" ? "POSCAR" : output.output_format;
    const blob = new Blob([output.output_content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suttain_structure.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "upload" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Upload className="w-4 h-4" /> Upload & Convert
        </button>
        <button
          onClick={() => setMode("build")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "build" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Boxes className="w-4 h-4" /> Build Crystal
        </button>
      </div>

      {mode === "upload" && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            {/* File upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Structure File (CIF, POSCAR, XYZ, PDB)
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
              >
                <FileBox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                {fileName ? (
                  <p className="text-sm font-medium text-slate-700">{fileName}</p>
                ) : (
                  <p className="text-sm text-slate-500">Click to upload a structure file</p>
                )}
                <p className="text-xs text-slate-400 mt-1">Supports CIF, POSCAR/CONTCAR, XYZ, PDB</p>
              </div>
              <input ref={fileRef} type="file" className="hidden" accept=".cif,.poscar,.contcar,.xyz,.pdb,.txt" onChange={handleFileUpload} />
            </div>

            {/* Format selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Input Format</label>
                <select
                  value={formatIn}
                  onChange={(e) => setFormatIn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="auto">Auto-detect</option>
                  {FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Convert To</label>
                <select
                  value={formatOut}
                  onChange={(e) => setFormatOut(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  {FORMATS.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleParse} disabled={!!loadingAction || !fileContent} size="sm" variant="outline" className="gap-2">
                {loadingAction === "parse" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Atom className="w-3.5 h-3.5" />}
                Parse & Visualize
              </Button>
              <Button onClick={handleConvert} disabled={!!loadingAction || !fileContent} size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                {loadingAction === "convert" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                Convert Format
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "build" && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Crystal Structure Type</label>
              <select
                value={buildType}
                onChange={(e) => setBuildType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
              >
                {BUILD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Lattice Constant (Å)</label>
                <input
                  type="text"
                  value={latticeConstant}
                  onChange={(e) => setLatticeConstant(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Element</label>
                <input
                  type="text"
                  value={buildElement}
                  onChange={(e) => setBuildElement(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-mono"
                />
              </div>
              {buildType === "nacl" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Element 2</label>
                  <input
                    type="text"
                    value={buildElement2}
                    onChange={(e) => setBuildElement2(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white font-mono"
                  />
                </div>
              )}
            </div>

            <Button onClick={handleBuild} disabled={!!loadingAction} size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
              {loadingAction === "build" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Boxes className="w-3.5 h-3.5" />}
              Build & Visualize
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          <Info className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-amber-100 text-amber-700 text-sm font-mono">{output.formula}</Badge>
              <Badge variant="outline" className="text-xs">{output.source}</Badge>
              <span className="text-xs text-slate-400">{output.method_note}</span>
            </div>

            {output.plain_language && (
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">{output.plain_language}</p>
              </div>
            )}

            {output.output_content && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                    Converted Output ({output.output_format.toUpperCase()})
                  </h4>
                  <pre className="bg-slate-900 text-green-300 rounded-xl p-4 overflow-x-auto text-xs leading-relaxed font-mono max-h-48 overflow-y-auto">
                    {output.output_content}
                  </pre>
                </div>
                <Button onClick={handleDownload} size="sm" variant="outline" className="gap-2">
                  <Download className="w-3.5 h-3.5" /> Download {output.output_format.toUpperCase()}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}