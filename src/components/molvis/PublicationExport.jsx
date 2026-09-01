/**
 * PublicationExport: High-res render settings and citation generator
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, BookOpen } from 'lucide-react';

const DPI_OPTIONS = [150, 300, 600];
const BG_OPTIONS = ['transparent', 'white', 'black'];
const LIGHTING_PRESETS = ['flat', 'soft', 'dramatic'];

const CITATIONS = {
  apa: `3Dmol.js: Rego, N., & Koes, D. (2015). 3Dmol.js: molecular visualization with WebGL. *Bioinformatics*, 31(8), 1322–1324. https://doi.org/10.1093/bioinformatics/btu829`,
  mla: `Rego, Nicholas, and David Koes. "3Dmol.js: Molecular Visualization with WebGL." *Bioinformatics* 31.8 (2015): 1322–1324. Web.`,
  nature: `Rego, N. & Koes, D. 3Dmol.js: molecular visualization with WebGL. *Bioinformatics* **31**, 1322–1324 (2015).`,
};

export default function PublicationExport({ onExport }) {
  const [dpi, setDpi] = useState(300);
  const [bg, setBg] = useState('white');
  const [lighting, setLighting] = useState('soft');
  const [shadows, setShadows] = useState(false);
  const [citFormat, setCitFormat] = useState('apa');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CITATIONS[citFormat]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-teal-400" />
          Publication Export
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Resolution (DPI)</label>
            <div className="flex gap-1">
              {DPI_OPTIONS.map(d => (
                <button key={d} onClick={() => setDpi(d)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    dpi === d ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {d} DPI
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Background</label>
            <div className="flex gap-1">
              {BG_OPTIONS.map(b => (
                <button key={b} onClick={() => setBg(b)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                    bg === b ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Lighting</label>
            <div className="flex gap-1">
              {LIGHTING_PRESETS.map(l => (
                <button key={l} onClick={() => setLighting(l)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                    lighting === l ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400">Shadows</span>
            <button
              onClick={() => setShadows(s => !s)}
              className={`w-10 h-5 rounded-full transition-colors relative ${shadows ? 'bg-teal-600' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${shadows ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onExport?.({ dpi, bg, lighting, shadows, format: 'png' })}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              PNG
            </Button>
            <Button
              onClick={() => onExport?.({ dpi, bg, lighting, shadows, format: 'svg' })}
              variant="outline"
              className="flex-1 border-teal-600 text-teal-400 hover:bg-teal-900/30 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              SVG
            </Button>
          </div>
        </div>
      </div>

      {/* Citation generator */}
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-400" />
          Citation Generator
        </h3>
        <div className="flex gap-1 mb-3">
          {Object.keys(CITATIONS).map(f => (
            <button key={f} onClick={() => setCitFormat(f)}
              className={`flex-1 py-1 rounded text-xs font-semibold uppercase transition-colors ${
                citFormat === f ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 mb-2">
          <p className="text-xs text-slate-300 leading-relaxed">{CITATIONS[citFormat]}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300"
        >
          <Copy className="w-3 h-3" />
          {copied ? 'Copied!' : 'Copy citation'}
        </button>
      </div>
    </div>
  );
}