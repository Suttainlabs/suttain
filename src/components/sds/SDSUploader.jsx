import React, { useRef, useState } from "react";
import { Upload, FileText, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function SDSUploader({ onResult }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const processFile = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Please upload a PDF or image file (PNG, JPG, WEBP).");
      return;
    }
    setError(null);
    setFileName(file.name);
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("parseSDS", { file_url });
      const data = res.data?.response || res.data;
      onResult(data, file.name);
    } catch (e) {
      setError("Failed to parse SDS: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !loading && inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-12 flex flex-col items-center justify-center gap-4 text-center
        ${dragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50"}
        ${loading ? "pointer-events-none" : ""}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => processFile(e.target.files[0])} />

      {loading ? (
        <>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
          <div>
            <p className="font-semibold text-slate-700">Analyzing SDS with AI...</p>
            <p className="text-sm text-slate-500 mt-1">{fileName}</p>
            <p className="text-xs text-slate-400 mt-1">Extracting chemical data, hazards & recommendations</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">Upload your Safety Data Sheet</p>
            <p className="text-slate-500 text-sm mt-1">Drag & drop or click to browse — PDF or image</p>
          </div>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 rounded-full" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            <Upload className="w-4 h-4 mr-2" />
            Choose SDS File
          </Button>
          <p className="text-xs text-slate-400">Supports PDF, PNG, JPG, WEBP — GHS/OSHA/REACH formats</p>
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}