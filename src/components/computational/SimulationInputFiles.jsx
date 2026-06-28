import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCode2, Copy, CheckCircle2, Download, ChevronDown, ChevronRight, FileText
} from "lucide-react";

export default function SimulationInputFiles({ result }) {
  const [expandedFiles, setExpandedFiles] = useState({});
  const [copiedFile, setCopiedFile] = useState(null);

  if (!result?.files?.length) return null;

  const toggleFile = (idx) => {
    setExpandedFiles(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = (file, idx) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFile(idx);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = (file) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Download as a single text bundle
    const bundle = result.files.map(f =>
      `=== ${f.filename} ===\n${f.description}\n\n${f.content}\n\n`
    ).join('\n');
    const blob = new Blob([bundle], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suttain_${result.engine}_inputs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-violet-600" />
            Simulation Input Files
            <Badge className="bg-green-100 text-green-700 text-xs">{result.files.length} files</Badge>
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">{result.engine}</Badge>
            <Button size="sm" variant="outline" onClick={handleDownloadAll} className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download All
            </Button>
          </div>
        </div>

        {result.summary && (
          <p className="text-sm text-slate-600 mb-4">{result.summary}</p>
        )}

        <div className="space-y-3">
          {result.files.map((file, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <button
                  onClick={() => toggleFile(idx)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                >
                  {expandedFiles[idx]
                    ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  }
                  <FileText className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span className="font-mono text-sm font-semibold text-slate-800 truncate">
                    {file.filename}
                  </span>
                </button>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(file, idx)}
                    className="h-7 px-2 gap-1 text-xs"
                  >
                    {copiedFile === idx
                      ? <CheckCircle2 className="w-3 h-3 text-green-600" />
                      : <Copy className="w-3 h-3" />
                    }
                    {copiedFile === idx ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(file)}
                    className="h-7 px-2 gap-1 text-xs"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {file.description && (
                <div className="px-4 py-2 bg-violet-50 border-t border-slate-100">
                  <p className="text-xs text-slate-600">{file.description}</p>
                </div>
              )}

              {expandedFiles[idx] && (
                <pre className="bg-slate-900 text-green-300 p-4 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-96">
                  {file.content}
                </pre>
              )}
            </div>
          ))}
        </div>

        {result.method_note && (
          <p className="text-xs text-slate-400 mt-4 italic">{result.method_note}</p>
        )}
      </CardContent>
    </Card>
  );
}