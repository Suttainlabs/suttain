import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ZapOff, Bug, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const CONFIRM_THRESHOLD = 3;
const MAX_LOG_ENTRIES = 20;

const LiveScanner = ({ isOpen, onClose, onScanSuccess }) => {
    const videoRef = useRef(null);
    const quaggaDivRef = useRef(null);
    const requestRef = useRef(null);
    const streamRef = useRef(null);
    const quaggaRef = useRef(null);
    const detectedRef = useRef(false);
    const consecutiveRef = useRef({ value: null, count: 0 });

    const [statusMessage, setStatusMessage] = useState('Position barcode in the viewfinder');
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [useQuagga, setUseQuagga] = useState(false);
    const [confirmedBarcode, setConfirmedBarcode] = useState(null);

    // Diagnostic mode state
    const [diagMode, setDiagMode] = useState(false);
    const [diagLog, setDiagLog] = useState([]);
    const [manualInput, setManualInput] = useState('');

    const hasNativeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

    const addDiagEntry = useCallback((entry) => {
        setDiagLog(prev => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));
    }, []);

    const isValidBarcode = (value) => {
        if (!value || typeof value !== 'string') return false;
        const clean = value.trim();
        if (clean.length < 4 || clean.length > 30) return false;
        if (/^(.)\1+$/.test(clean)) return false;
        return true;
    };

    const handleConfirmedDetection = useCallback((code) => {
        if (detectedRef.current) return;
        detectedRef.current = true;
        setConfirmedBarcode(code);
        setStatusMessage(`Confirmed: ${code}`);
        setTimeout(() => onScanSuccess(code), 400);
    }, [onScanSuccess]);

    const confirmDetection = useCallback((code, meta = {}) => {
        if (!isValidBarcode(code)) return;
        const ref = consecutiveRef.current;

        if (diagMode) {
            addDiagEntry({
                code,
                time: new Date().toLocaleTimeString(),
                confidence: meta.confidence ?? null,
                format: meta.format ?? 'unknown',
                consecutive: ref.value === code ? ref.count + 1 : 1,
            });
        }

        if (ref.value === code) {
            ref.count += 1;
            if (ref.count >= CONFIRM_THRESHOLD) {
                handleConfirmedDetection(code);
            }
        } else {
            ref.value = code;
            ref.count = 1;
        }
    }, [diagMode, addDiagEntry, handleConfirmedDetection]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        const val = manualInput.trim();
        if (!val) return;
        onScanSuccess(val);
    };

    const resetScanner = () => {
        detectedRef.current = false;
        consecutiveRef.current = { value: null, count: 0 };
        setConfirmedBarcode(null);
        setStatusMessage('Point camera at a barcode');
        setDiagLog([]);
        setManualInput('');
    };

    const setupCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                }
            });
            streamRef.current = stream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities?.() || {};
            if (capabilities.torch) setTorchSupported(true);
            return stream;
        } catch (err) {
            setStatusMessage(
                err.name === 'NotAllowedError'
                    ? 'Camera access denied. Please allow camera in your browser settings.'
                    : 'Camera not available on this device.'
            );
            return null;
        }
    }, []);

    const toggleTorch = async () => {
        if (!streamRef.current || !torchSupported) return;
        const track = streamRef.current.getVideoTracks()[0];
        await track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
        setIsTorchOn(prev => !prev);
    };

    // Native BarcodeDetector scan loop
    const scanFrame = useCallback(async (detector) => {
        if (detectedRef.current) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
            try {
                const barcodes = await detector.detect(video);
                if (barcodes.length > 0) {
                    const bc = barcodes[0];
                    confirmDetection(bc.rawValue, { format: bc.format });
                    if (!detectedRef.current) {
                        setStatusMessage(`Reading... (${consecutiveRef.current.count}/${CONFIRM_THRESHOLD})`);
                    }
                } else {
                    consecutiveRef.current = { value: null, count: 0 };
                }
            } catch (_) {}
        }
        if (!detectedRef.current) {
            requestRef.current = requestAnimationFrame(() => scanFrame(detector));
        }
    }, [confirmDetection]);

    // Native BarcodeDetector path
    useEffect(() => {
        if (!isOpen || !hasNativeDetector) return;

        detectedRef.current = false;
        consecutiveRef.current = { value: null, count: 0 };
        setStatusMessage('Starting camera...');
        setConfirmedBarcode(null);
        setIsTorchOn(false);
        setUseQuagga(false);
        setDiagLog([]);

        let cancelled = false;

        const start = async () => {
            let formats = ['ean_13', 'upc_a', 'upc_e', 'ean_8', 'code_128', 'code_39', 'qr_code'];
            try {
                const supported = await window.BarcodeDetector.getSupportedFormats();
                if (supported.length > 0) formats = supported;
            } catch (_) {}

            const detector = new window.BarcodeDetector({ formats });
            const stream = await setupCamera();
            if (!stream || cancelled) return;

            const video = videoRef.current;
            if (video) {
                video.srcObject = stream;
                await video.play();
                setStatusMessage('Point camera at a barcode');
                requestRef.current = requestAnimationFrame(() => scanFrame(detector));
            }
        };

        start();

        return () => {
            cancelled = true;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        };
    }, [isOpen, hasNativeDetector, scanFrame, setupCamera]);

    // Quagga fallback path
    useEffect(() => {
        if (!isOpen || hasNativeDetector) return;

        detectedRef.current = false;
        consecutiveRef.current = { value: null, count: 0 };
        setStatusMessage('Starting camera...');
        setConfirmedBarcode(null);
        setUseQuagga(true);
        setDiagLog([]);

        let Quagga;
        let started = false;

        const startQuagga = async () => {
            try {
                const mod = await import('@ericblade/quagga2');
                Quagga = mod.default;
                quaggaRef.current = Quagga;

                Quagga.init({
                    inputStream: {
                        type: 'LiveStream',
                        target: quaggaDivRef.current,
                        constraints: {
                            facingMode: 'environment',
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        },
                        area: { top: '20%', right: '10%', left: '10%', bottom: '20%' },
                    },
                    decoder: {
                        readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader'],
                        multiple: false,
                    },
                    locate: true,
                    numOfWorkers: 2,
                    frequency: 10,
                }, (err) => {
                    if (err) {
                        const msg = err.name === 'NotAllowedError' || String(err).includes('Permission')
                            ? 'Camera access denied.'
                            : 'Camera not available on this device.';
                        setStatusMessage(msg);
                        return;
                    }
                    started = true;
                    Quagga.start();
                    setStatusMessage('Point camera at a barcode');
                });

                Quagga.onDetected((result) => {
                    if (detectedRef.current) return;
                    const code = result?.codeResult?.code;
                    const errors = result?.codeResult?.decodedCodes
                        ?.filter(c => c.error !== undefined)
                        ?.map(c => c.error) || [];
                    const avgError = errors.length ? errors.reduce((a, b) => a + b, 0) / errors.length : 1;

                    // In diag mode show even low-confidence reads; otherwise filter them
                    if (!diagMode && avgError > 0.25) return;

                    confirmDetection(code, {
                        format: result?.codeResult?.format,
                        confidence: Math.round((1 - avgError) * 100),
                    });

                    if (!detectedRef.current) {
                        setStatusMessage(`Reading... (${consecutiveRef.current.count}/${CONFIRM_THRESHOLD})`);
                    }
                });
            } catch (e) {
                setStatusMessage('Scanner unavailable. Use manual entry below.');
            }
        };

        startQuagga();

        return () => {
            if (quaggaRef.current) {
                try { if (started) quaggaRef.current.stop(); } catch (_) {}
                quaggaRef.current = null;
            }
        };
    }, [isOpen, hasNativeDetector, confirmDetection, diagMode]);

    // Stop everything when closed
    useEffect(() => {
        if (!isOpen) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
            if (quaggaRef.current) { try { quaggaRef.current.stop(); } catch (_) {} quaggaRef.current = null; }
            detectedRef.current = false;
            consecutiveRef.current = { value: null, count: 0 };
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full p-0 bg-slate-900 border-slate-700 text-white overflow-hidden shadow-2xl">

                {/* Camera viewfinder */}
                <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                        {useQuagga ? (
                            <div ref={quaggaDivRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline autoPlay muted />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-0 flex items-center justify-center p-10">
                                <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
                                    {[
                                        'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                                        'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                                        'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                                        'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
                                    ].map((cls, i) => (
                                        <div key={i} className={`absolute w-8 h-8 border-white ${cls}`} />
                                    ))}
                                    <div className={`absolute left-0 right-0 h-0.5 top-1/2 -translate-y-1/2 ${confirmedBarcode ? 'bg-green-400' : 'bg-red-400'} opacity-80 animate-pulse`} />
                                </div>
                            </div>
                        </div>

                        {/* Torch */}
                        {torchSupported && !useQuagga && (
                            <Button variant="ghost" size="icon" onClick={toggleTorch}
                                className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full h-10 w-10 z-10">
                                {isTorchOn ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                            </Button>
                        )}

                        {/* Diag toggle */}
                        <Button variant="ghost" size="icon" onClick={() => setDiagMode(p => !p)}
                            className={`absolute top-4 right-14 rounded-full h-10 w-10 z-10 ${diagMode ? 'bg-amber-500/80 text-white' : 'text-white hover:bg-white/20'}`}
                            title="Diagnostic mode">
                            <Bug className="w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>

                {/* Status + controls */}
                <div className="bg-slate-800 border-t border-slate-700 px-4 pt-3 pb-2">
                    <p className={`text-center font-semibold text-sm ${confirmedBarcode ? 'text-green-400' : 'text-slate-200'}`}>
                        {statusMessage}
                    </p>

                    {/* Manual override */}
                    <form onSubmit={handleManualSubmit} className="flex gap-2 mt-3">
                        <Input
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value.replace(/[^0-9a-zA-Z\-]/g, ''))}
                            placeholder="Enter barcode manually..."
                            className="flex-1 h-9 text-sm bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400"
                        />
                        <Button type="submit" size="sm" disabled={!manualInput.trim()}
                            className="h-9 bg-amber-500 hover:bg-amber-600 text-white px-3 shrink-0">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        {confirmedBarcode && (
                            <Button type="button" size="sm" variant="ghost" onClick={resetScanner}
                                className="h-9 text-slate-400 hover:text-white px-2 shrink-0">
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        )}
                    </form>
                </div>

                {/* Diagnostic log panel */}
                <AnimatePresence>
                    {diagMode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-950 border-t border-slate-700 overflow-hidden"
                        >
                            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Diagnostic Log</span>
                                <button onClick={() => setDiagLog([])} className="text-slate-500 hover:text-slate-300 text-xs">Clear</button>
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                                {diagLog.length === 0 ? (
                                    <p className="text-slate-600 text-xs text-center py-4">No detections yet</p>
                                ) : (
                                    diagLog.map((entry, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-800/50 hover:bg-slate-900/50">
                                            <button
                                                onClick={() => onScanSuccess(entry.code)}
                                                className="text-xs font-mono text-amber-300 hover:text-amber-200 hover:underline text-left flex-1 truncate"
                                                title={`Use: ${entry.code}`}
                                            >
                                                {entry.code}
                                            </button>
                                            <span className="text-slate-500 text-[10px] shrink-0">{entry.format}</span>
                                            {entry.confidence !== null && (
                                                <span className={`text-[10px] font-semibold shrink-0 ${entry.confidence >= 75 ? 'text-green-400' : entry.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {entry.confidence}%
                                                </span>
                                            )}
                                            <span className="text-slate-600 text-[10px] shrink-0">{entry.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-slate-600 text-[10px] text-center py-1.5">Tap a code to use it directly</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button variant="ghost" size="icon" onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10 z-20">
                    <X className="w-5 h-5" />
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default LiveScanner;