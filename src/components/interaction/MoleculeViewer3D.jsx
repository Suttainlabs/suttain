import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Atom, ChevronDown, ChevronUp, Loader2, AlertCircle, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

let loadPromise = null;

function load3Dmol() {
  if (window.$3Dmol) return Promise.resolve(window.$3Dmol);
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://3Dmol.org/build/3Dmol-min.js';
    script.async = true;
    script.onload = () => {
      if (window.$3Dmol) resolve(window.$3Dmol);
      else reject(new Error('3Dmol.js failed to initialize'));
    };
    script.onerror = () => reject(new Error('Failed to load 3Dmol.js from CDN'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export default function MoleculeViewer3D({ ingredientName, index }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [molInfo, setMolInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(index < 4);

  useEffect(() => {
    if (!ingredientName || !isExpanded) return;

    let cancelled = false;

    const loadMolecule = async () => {
      setStatus('loading');
      try {
        const $3Dmol = await load3Dmol();
        if (cancelled) return;

        // Fetch CID by name
        const cidRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(ingredientName)}/cids/JSON`
        );
        if (!cidRes.ok) throw new Error('Compound not found in PubChem');
        const cidData = await cidRes.json();
        const cid = cidData?.IdentifierList?.CID?.[0];
        if (!cid) throw new Error('No CID found');
        if (cancelled) return;

        // Fetch properties
        try {
          const propRes = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight/JSON`
          );
          const propData = await propRes.json();
          setMolInfo(propData?.PropertyTable?.Properties?.[0]);
        } catch {}

        if (cancelled) return;

        // Fetch 3D SDF
        let sdfRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`
        );
        let sdfData = await sdfRes.text();
        if (!sdfData || sdfData.includes('Error')) {
          // Fallback to 2D
          sdfRes = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=2d`
          );
          sdfData = await sdfRes.text();
        }
        if (cancelled) return;

        // Clear container and create viewer
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        const viewer = $3Dmol.createViewer(containerRef.current, { backgroundColor: 'white' });
        viewerRef.current = viewer;
        viewer.addModel(sdfData, 'sdf');
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });
        viewer.zoomTo();
        viewer.render();
        viewer.spin(true);
        setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          console.error(`Molecule load failed for ${ingredientName}:`, err);
          setStatus('error');
        }
      }
    };

    loadMolecule();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try { viewerRef.current.clear(); } catch {}
        viewerRef.current = null;
      }
    };
  }, [ingredientName, isExpanded]);

  const handleZoom = (dir) => {
    if (viewerRef.current) {
      try {
        if (dir === 'in') viewerRef.current.zoom(1.2);
        else viewerRef.current.zoom(0.8);
        viewerRef.current.render();
      } catch {}
    }
  };

  const handleRotate = () => {
    if (viewerRef.current) {
      try { viewerRef.current.spin(!viewerRef.current.spin()); } catch {}
    }
  };

  return (
    <Card className="border-slate-200 overflow-hidden">
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Atom className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <CardTitle className="text-sm truncate">{ingredientName}</CardTitle>
            {molInfo && (
              <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                {molInfo.MolecularFormula}
              </Badge>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="relative">
            <div
              ref={containerRef}
              className="w-full h-56 bg-white rounded-lg border border-slate-100"
              style={{ minHeight: '224px' }}
            />
            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg">
                <Loader2 className="w-6 h-6 text-teal-600 animate-spin mb-2" />
                <p className="text-xs text-slate-500">Loading 3D structure from PubChem...</p>
              </div>
            )}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">3D structure not available</p>
                <p className="text-[10px] text-slate-400 mt-1">PubChem may not have this compound</p>
              </div>
            )}
            {status === 'ready' && (
              <div className="absolute top-2 right-2 flex gap-1">
                <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleZoom('in'); }}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleZoom('out'); }}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleRotate(); }}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
          {molInfo && (
            <p className="text-[10px] text-slate-400 mt-1">
              MW: {molInfo.MolecularWeight} g/mol | Source: PubChem CID
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}