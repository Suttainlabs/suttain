import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ViewerNGL({ pdbUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nglReady, setNglReady] = useState(false);
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  // Load NGL from CDN
  useEffect(() => {
    if (window.NGL) { setNglReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/ngl@2.0.0-dev.37/dist/ngl.js';
    script.async = true;
    script.onload = () => setNglReady(true);
    script.onerror = () => setError('Failed to load NGL viewer library');
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Initialize NGL stage when library + pdbUrl are ready
  useEffect(() => {
    if (!nglReady || !pdbUrl || !containerRef.current) return;
    const NGL = window.NGL;
    setLoading(true);
    containerRef.current.innerHTML = '';

    const stage = new NGL.Stage(containerRef.current, {
      backgroundColor: 'white',
    });
    stageRef.current = stage;

    stage.loadFile(pdbUrl, { ext: 'pdb' })
      .then(component => {
        // Color by B-factor (AlphaFold stores pLDDT in B-factor column)
        // Using AlphaFold's standard color scale: orange -> yellow -> cyan -> blue
        component.addRepresentation('cartoon', {
          colorScheme: 'bfactor',
          colorScale: [0xFF7D45, 0xFFDB13, 0x65CBF3, 0x0053D6],
          colorDomain: [0, 50, 70, 90],
        });
        component.autoView();
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Failed to load structure');
        setLoading(false);
      });

    return () => {
      if (stageRef.current) {
        stageRef.current.dispose();
        stageRef.current = null;
      }
    };
  }, [nglReady, pdbUrl]);

  const handleRotate = () => stageRef.current?.setSpin(true);
  const handleStopRotate = () => stageRef.current?.setSpin(false);
  const handleZoomIn = () => stageRef.current?.viewerControls.zoom(0.1);
  const handleZoomOut = () => stageRef.current?.viewerControls.zoom(-0.1);
  const handleReset = () => {
    if (!stageRef.current) return;
    stageRef.current.setSpin(false);
    stageRef.current.autoView();
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