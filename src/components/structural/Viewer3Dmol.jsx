import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// AlphaFold standard pLDDT confidence colors
function plddtToColor(b) {
  if (b > 90) return '#0053D6';   // Very high — blue
  if (b >= 70) return '#65CBF3';  // Confident — cyan
  if (b >= 50) return '#FFDB13';  // Low — yellow
  return '#FF7D45';               // Very low — orange
}

export default function Viewer3Dmol({ pdbUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [molReady, setMolReady] = useState(false);
  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  // Load 3Dmol.js from CDN
  useEffect(() => {
    if (window.$3Dmol) { setMolReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://3dmol.org/build/3Dmol-min.js';
    script.async = true;
    script.onload = () => setMolReady(true);
    script.onerror = () => setError('Failed to load 3Dmol.js library');
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Initialize viewer when library + pdbUrl are ready
  useEffect(() => {
    if (!molReady || !pdbUrl || !containerRef.current) return;
    const $3Dmol = window.$3Dmol;
    setLoading(true);
    containerRef.current.innerHTML = '';
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: '0xffffff',
      antialias: true,
    });
    viewerRef.current = viewer;

    fetch(pdbUrl)
      .then(r => r.text())
      .then(pdbData => {
        viewer.addModel(pdbData, 'pdb');

        // AlphaFold PDB files store pLDDT scores in the B-factor column.
        // The built-in `color: 'pLDDT'` scheme can fail silently and render all black.
        // Manually group atoms by confidence level and apply AlphaFold's standard colors.
        const atoms = viewer.getModel().selectedAtoms({});
        const colorGroups = {};
        atoms.forEach(atom => {
          const color = plddtToColor(atom.b);
          if (!colorGroups[color]) colorGroups[color] = [];
          colorGroups[color].push(atom.serial);
        });
        Object.entries(colorGroups).forEach(([color, serials]) => {
          viewer.setStyle({ serial: serials }, { cartoon: { color } });
        });

        viewer.zoomTo();
        viewer.render();
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Failed to load structure');
        setLoading(false);
      });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.clear();
        viewerRef.current = null;
      }
    };
  }, [molReady, pdbUrl]);

  const handleRotate = () => viewerRef.current?.spin('y', 1);
  const handleStopRotate = () => viewerRef.current?.spin(false);
  const handleZoomIn = () => viewerRef.current?.zoom(0.5, 300);
  const handleZoomOut = () => viewerRef.current?.zoom(-0.5, 300);
  const handleReset = () => {
    if (!viewerRef.current) return;
    viewerRef.current.spin(false);
    viewerRef.current.zoomTo();
    viewerRef.current.render();
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={containerRef}
          style={{ width: '100%', height: '400px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}
          className="border border-slate-200"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button size="sm" variant="outline" onClick={handleRotate} className="border-slate-300 text-slate-700 text-xs">
          <RotateCw className="w-3 h-3 mr-1" /> Rotate
        </Button>
        <Button size="sm" variant="outline" onClick={handleStopRotate} className="border-slate-300 text-slate-700 text-xs">
          Stop
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomIn} className="border-slate-300 text-slate-700 text-xs">
          <ZoomIn className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomOut} className="border-slate-300 text-slate-700 text-xs">
          <ZoomOut className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className="border-slate-300 text-slate-700 text-xs">
          <Maximize2 className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}