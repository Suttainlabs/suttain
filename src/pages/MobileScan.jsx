import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Zap, ZapOff, RotateCcw, CheckCircle2,
  AlertTriangle, ShieldAlert, Leaf, ChevronDown, ChevronUp,
  Loader2, Search, X, Info
} from 'lucide-react';

const RISK_CONFIG = {
  low:     { color: 'text-green-400',  bg: 'bg-green-500/20',  border: 'border-green-500/40',  label: 'Low Risk',     icon: CheckCircle2 },
  medium:  { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', label: 'Medium Risk',   icon: AlertTriangle },
  high:    { color: 'text-red-400',    bg: 'bg-red-500/20',    border: 'border-red-500/40',    label: 'High Risk',    icon: ShieldAlert },
  unknown: { color: 'text-slate-400',  bg: 'bg-slate-500/20',  border: 'border-slate-500/40',  label: 'Risk Unknown', icon: Info },
};

function SafetyBadge({ score }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <span className={`inline-block w-8 h-8 rounded-full ${color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
      {score}
    </span>
  );
}

function ResultPanel({ product, onReset }) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const risk = RISK_CONFIG[product.riskAssessment?.overallRisk] || RISK_CONFIG.unknown;
  const RiskIcon = risk.icon;
  const ingredients = product.ingredients || [];
  const visibleIngredients = showAllIngredients ? ingredients : ingredients.slice(0, 5);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      className="absolute inset-0 bg-slate-900 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center gap-3">
        <button onClick={onReset} className="p-2 rounded-full hover:bg-slate-700 text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{product.name}</p>
          <p className="text-slate-400 text-xs truncate">{product.brand}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${risk.bg} ${risk.border} border`}>
          <RiskIcon className={`w-3.5 h-3.5 ${risk.color}`} />
          <span className={`text-xs font-bold ${risk.color}`}>{risk.label}</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Product card */}
        <div className="flex gap-3 bg-slate-800 rounded-2xl p-4">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 object-contain rounded-xl bg-white/10 flex-shrink-0"
              onError={e => e.target.style.display = 'none'}
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base leading-tight">{product.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{product.brand}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge className="bg-slate-700 text-slate-300 text-xs border-0">{product.category}</Badge>
              <Badge className="bg-slate-700 text-slate-300 text-xs border-0">{product.source}</Badge>
            </div>
          </div>
        </div>

        {/* Hazards */}
        {product.hazards?.length > 0 && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <p className="text-red-300 font-bold text-sm">Hazard Alerts</p>
            </div>
            {product.hazards.map((hazard, i) => (
              <p key={i} className="text-red-200 text-sm leading-relaxed">⚠ {hazard.description}</p>
            ))}
          </div>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-teal-400" />
              <p className="text-white font-bold text-sm">Ingredients ({ingredients.length})</p>
            </div>
            <div className="space-y-2">
              {visibleIngredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SafetyBadge score={ing.safety || 80} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{ing.name}</p>
                    <p className="text-slate-400 text-xs">{ing.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
            {ingredients.length > 5 && (
              <button
                onClick={() => setShowAllIngredients(!showAllIngredients)}
                className="flex items-center gap-1 text-teal-400 text-sm font-medium mt-1"
              >
                {showAllIngredients ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Show {ingredients.length - 5} more</>}
              </button>
            )}
          </div>
        )}

        {/* Analysis notes */}
        {product.analysisNotes?.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <p className="text-white font-bold text-sm">Analysis Notes</p>
            </div>
            {product.analysisNotes.map((note, i) => (
              <p key={i} className="text-slate-300 text-xs leading-relaxed">• {note}</p>
            ))}
          </div>
        )}

        {/* Scan another */}
        <Button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold h-12 rounded-xl mt-2"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Scan Another Product
        </Button>
      </div>
    </motion.div>
  );
}

export default function MobileScan() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const quaggaDivRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(null);
  const quaggaRef = useRef(null);
  const detectedRef = useRef(false);
  const manualInputRef = useRef(null);

  const [phase, setPhase] = useState('scanning'); // scanning | loading | result | manual
  const [statusMsg, setStatusMsg] = useState('Point camera at a barcode');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [useQuagga, setUseQuagga] = useState(false);

  const hasNativeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const stopCamera = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (quaggaRef.current) { try { quaggaRef.current.stop(); } catch (_) {} quaggaRef.current = null; }
  }, []);

  const fetchProduct = useCallback(async (barcode) => {
    stopCamera();
    setPhase('loading');
    setError('');
    try {
      const { data } = await base44.functions.invoke('lookupBarcode', { barcode });
      if (data) {
        setProduct(data);
        setPhase('result');
        // Save to history silently
        base44.entities.BarcodeHistory.create({
          barcode,
          product_name: data.name,
          product_image: data.imageUrl,
          scan_method: 'live_scan',
          ingredient_count: data.ingredients?.length || 0,
          analysis_completed: true,
        }).catch(() => {});
      } else {
        throw new Error('No data returned');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not look up product. Please try again.');
      setPhase('scanning');
      startCamera();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopCamera]);

  const startCamera = useCallback(() => {
    detectedRef.current = false;
    setStatusMsg('Point camera at a barcode');
    setError('');

    if (hasNativeDetector) {
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'upc_a', 'upc_e', 'ean_8', 'code_128', 'code_39', 'qr_code'],
      });

      const scan = async () => {
        if (detectedRef.current) return;
        if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              detectedRef.current = true;
              setStatusMsg(`✓ Found: ${barcodes[0].rawValue}`);
              setTimeout(() => fetchProduct(barcodes[0].rawValue), 300);
              return;
            }
          } catch (_) {}
        }
        requestRef.current = requestAnimationFrame(scan);
      };

      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      }).then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            requestRef.current = requestAnimationFrame(scan);
            // Check torch support
            const track = stream.getVideoTracks()[0];
            if (track?.getCapabilities()?.torch) setTorchSupported(true);
          });
        }
      }).catch(err => {
        setStatusMsg(err.name === 'NotAllowedError' ? 'Camera access denied. Please allow camera access.' : 'Camera unavailable on this device.');
        setError('Use manual entry below to look up a product.');
      });
    } else {
      // QuaggaJS fallback
      setUseQuagga(true);
      import('@ericblade/quagga2').then(mod => {
        const Quagga = mod.default;
        quaggaRef.current = Quagga;
        Quagga.init({
          inputStream: {
            type: 'LiveStream',
            target: quaggaDivRef.current,
            constraints: { facingMode: 'environment' },
          },
          decoder: {
            readers: ['ean_reader', 'upc_reader', 'upc_e_reader', 'ean_8_reader', 'code_128_reader'],
          },
          locate: true,
        }, (err) => {
          if (err) {
            setStatusMsg('Camera unavailable. Use manual entry below.');
            setError('Use manual entry to look up a product.');
            return;
          }
          Quagga.start();
          setStatusMsg('Point camera at a barcode');
        });
        Quagga.onDetected((result) => {
          if (detectedRef.current) return;
          const code = result?.codeResult?.code;
          if (code) {
            detectedRef.current = true;
            Quagga.stop();
            setStatusMsg(`✓ Found: ${code}`);
            setTimeout(() => fetchProduct(code), 300);
          }
        });
      }).catch(() => {
        setStatusMsg('Scanner unavailable. Use manual entry below.');
        setError('Use manual entry to look up a product.');
      });
    }
  }, [hasNativeDetector, fetchProduct]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = useCallback(() => {
    setProduct(null);
    setPhase('scanning');
    setManualCode('');
    setError('');
    startCamera();
  }, [startCamera]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) fetchProduct(manualCode.trim());
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
    setTorchOn(!torchOn);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden" style={{ zIndex: 100 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-sm z-10">
        <button onClick={() => { stopCamera(); navigate(-1); }} className="p-2 rounded-full hover:bg-slate-700 text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-white font-bold text-sm">Barcode Scanner</p>
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* Camera viewport */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {useQuagga ? (
          <div ref={quaggaDivRef} className="w-full h-full" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Dark corners */}
          <div className="absolute inset-0 bg-black/40" style={{ maskImage: 'radial-gradient(ellipse 65% 28% at center, transparent 100%, black 100%)' }} />

          {/* Scan frame */}
          <div className="relative w-72 h-36 mt-[-60px]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
            {/* Scan line animation */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-bounce" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>

        {/* Torch button */}
        {torchSupported && (
          <button
            onClick={toggleTorch}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            {torchOn ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Bottom panel */}
      <div className="bg-slate-900 px-4 pt-4 pb-6 space-y-3">
        <p className="text-center text-slate-300 text-sm font-medium">{statusMsg}</p>
        {error && <p className="text-center text-red-400 text-xs">{error}</p>}

        {/* Manual entry */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            ref={manualInputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter barcode manually..."
            value={manualCode}
            onChange={e => setManualCode(e.target.value.replace(/\D/g, ''))}
            className="flex-1 bg-slate-800 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || phase === 'loading'}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-4 z-20"
          >
            <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
            <p className="text-white font-semibold">Analyzing product...</p>
            <p className="text-slate-400 text-sm">Checking safety & ingredients</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result panel */}
      <AnimatePresence>
        {phase === 'result' && product && (
          <div className="absolute inset-0 z-30">
            <ResultPanel product={product} onReset={handleReset} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}