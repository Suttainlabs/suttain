import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, Loader2, PenLine } from 'lucide-react';

let jsmeLoaded = false;
let jsmeCallbacks = [];
function loadJSME(cb) {
  if (jsmeLoaded && window.JSApplet) { cb(); return; }
  jsmeCallbacks.push(cb);
  if (document.querySelector('script[data-jsme]')) return;
  const script = document.createElement('script');
  script.setAttribute('data-jsme', '1');
  script.src = 'https://jsme-editor.github.io/dist/jsme/jsme.nocache.js';
  script.onload = () => {
    // JSME calls jsmeOnLoad when ready
    window.jsmeOnLoad = () => {
      jsmeLoaded = true;
      jsmeCallbacks.forEach(fn => fn());
      jsmeCallbacks = [];
    };
  };
  document.head.appendChild(script);
}

export default function MoleculeDrawer({ isOpen, onClose, onConfirm, initialSmiles = '' }) {
  const containerRef = useRef(null);
  const appletRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentSmiles, setCurrentSmiles] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setCurrentSmiles('');
    appletRef.current = null;

    loadJSME(() => {
      if (!containerRef.current) return;
      // Small delay to ensure DOM is stable
      setTimeout(() => {
        if (!containerRef.current) return;
        appletRef.current = new window.JSApplet.JSME('jsme-container', '100%', '420px', {
          options: 'query,hydrogens,newlook',
        });
        if (initialSmiles) {
          appletRef.current.readGenericMolecularInput(initialSmiles);
        }
        setLoading(false);
      }, 200);
    });

    // If JSME is already loaded but jsmeOnLoad hasn't fired yet, handle it
    if (jsmeLoaded && window.JSApplet) {
      setTimeout(() => {
        if (!containerRef.current || appletRef.current) return;
        appletRef.current = new window.JSApplet.JSME('jsme-container', '100%', '420px', {
          options: 'query,hydrogens,newlook',
        });
        if (initialSmiles) {
          appletRef.current.readGenericMolecularInput(initialSmiles);
        }
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const handleUseStructure = () => {
    if (appletRef.current) {
      const smiles = appletRef.current.smiles();
      if (smiles && smiles.trim()) {
        onConfirm(smiles.trim());
        onClose();
      }
    }
  };

  const handlePreview = () => {
    if (appletRef.current) {
      setCurrentSmiles(appletRef.current.smiles() || '');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-600 to-purple-600">
          <div className="flex items-center gap-2 text-white">
            <PenLine className="w-5 h-5" />
            <span className="font-bold text-lg">Molecular Structure Editor</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-5 py-2.5 bg-violet-50 border-b border-violet-100">
          <p className="text-xs text-violet-800">
            <span className="font-semibold">Draw your molecule</span> using the toolbar on the left. Click atoms to place them, bonds to connect. 
            Use the ring buttons for cyclic structures. When done, click <strong>Use Structure</strong>.
          </p>
        </div>

        {/* JSME Editor */}
        <div className="relative flex-1 min-h-[420px] bg-white">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading molecular editor…</p>
            </div>
          )}
          <div id="jsme-container" ref={containerRef} className="w-full" style={{ minHeight: '420px' }} />
        </div>

        {/* SMILES preview */}
        {currentSmiles && (
          <div className="px-5 py-2 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-1">SMILES Preview:</p>
            <code className="text-xs text-violet-700 font-mono bg-violet-50 px-2 py-1 rounded break-all">{currentSmiles}</code>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" size="sm" onClick={handlePreview} disabled={loading}>
            Preview SMILES
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleUseStructure}
              disabled={loading}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              Use Structure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}