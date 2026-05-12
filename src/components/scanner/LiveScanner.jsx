import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, ZapOff, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const LiveScanner = ({ isOpen, onClose, onScanSuccess }) => {
    const videoRef = useRef(null);
    const quaggaDivRef = useRef(null);
    const requestRef = useRef();
    const streamRef = useRef(null);
    const quaggaRef = useRef(null);
    const detectedRef = useRef(false);

    const [statusMessage, setStatusMessage] = useState('Position barcode in the viewfinder');
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [torchSupported, setTorchSupported] = useState(false);
    const [zoomSupported, setZoomSupported] = useState(false);
    const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });
    const [detectedBarcodeBox, setDetectedBarcodeBox] = useState(null);
    const [useQuagga, setUseQuagga] = useState(false);

    const hasNativeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

    const scanFrame = useCallback(async (detector) => {
        if (detectedRef.current) return;
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                    detectedRef.current = true;
                    setStatusMessage(`Barcode found: ${barcodes[0].rawValue}`);
                    setDetectedBarcodeBox(barcodes[0].boundingBox);
                    setTimeout(() => onScanSuccess(barcodes[0].rawValue), 300);
                    return;
                }
            } catch (e) {
                console.error("Barcode detection error:", e);
            }
        }
        requestRef.current = requestAnimationFrame(() => scanFrame(detector));
    }, [onScanSuccess]);

    const setupCameraControls = (stream) => {
        const track = stream.getVideoTracks()[0];
        if (!track) return;
        const capabilities = track.getCapabilities();
        if (capabilities.torch) setTorchSupported(true);
        if (capabilities.zoom) {
            setZoomSupported(true);
            setZoomRange({ min: capabilities.zoom.min, max: capabilities.zoom.max, step: capabilities.zoom.step });
        }
    };

    const toggleTorch = async () => {
        if (streamRef.current && torchSupported) {
            const track = streamRef.current.getVideoTracks()[0];
            await track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
            setIsTorchOn(!isTorchOn);
        }
    };

    const handleZoom = async (direction) => {
        if (streamRef.current && zoomSupported) {
            const newZoom = direction === 'in'
                ? Math.min(zoomLevel + zoomRange.step, zoomRange.max)
                : Math.max(zoomLevel - zoomRange.step, zoomRange.min);
            const track = streamRef.current.getVideoTracks()[0];
            await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
            setZoomLevel(newZoom);
        }
    };

    // Native BarcodeDetector path
    useEffect(() => {
        if (!isOpen || !hasNativeDetector) return;

        setStatusMessage('Searching for barcode...');
        setDetectedBarcodeBox(null);
        setIsTorchOn(false);
        setZoomLevel(1);
        detectedRef.current = false;
        setUseQuagga(false);

        const startScan = async () => {
            // Get all formats the device supports, fall back to a broad hardcoded list
            let formats = ['ean_13', 'upc_a', 'upc_e', 'qr_code', 'ean_8', 'code_128', 'code_39', 'code_93', 'codabar', 'itf', 'pdf417', 'aztec', 'data_matrix'];
            try {
                const supported = await window.BarcodeDetector.getSupportedFormats();
                if (supported.length > 0) formats = supported;
            } catch (_) {}
            const barcodeDetector = new window.BarcodeDetector({ formats });
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setupCameraControls(stream);
                    requestRef.current = requestAnimationFrame(() => scanFrame(barcodeDetector));
                }
            } catch (err) {
                setStatusMessage(err.name === 'NotAllowedError' ? 'Camera access denied.' : 'Live camera not available.');
            }
        };

        startScan();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        };
    }, [isOpen, hasNativeDetector, scanFrame]);

    // QuaggaJS fallback path
    useEffect(() => {
        if (!isOpen || hasNativeDetector) return;

        setStatusMessage('Searching for barcode...');
        setDetectedBarcodeBox(null);
        detectedRef.current = false;
        setUseQuagga(true);

        let Quagga;
        const startQuagga = async () => {
            try {
                const mod = await import('@ericblade/quagga2');
                Quagga = mod.default;
                quaggaRef.current = Quagga;

                Quagga.init({
                    inputStream: {
                        type: 'LiveStream',
                        target: quaggaDivRef.current,
                        constraints: { facingMode: 'environment' },
                    },
                    decoder: {
                        readers: [
                            'ean_reader',
                            'ean_8_reader',
                            'upc_reader',
                            'upc_e_reader',
                            'code_128_reader',
                            'code_39_reader',
                            'code_93_reader',
                            'codabar_reader',
                            'i2of5_reader',
                        ],
                        multiple: false,
                    },
                    locate: true,
                }, (err) => {
                    if (err) {
                        console.error('Quagga init error:', err);
                        setStatusMessage(err.name === 'NotAllowedError' || String(err).includes('Permission') ? 'Camera access denied.' : 'Camera not available on this device.');
                        return;
                    }
                    Quagga.start();
                    setStatusMessage('Point camera at a barcode...');
                });

                Quagga.onDetected((result) => {
                    if (detectedRef.current) return;
                    const code = result?.codeResult?.code;
                    if (code) {
                        detectedRef.current = true;
                        setStatusMessage(`Barcode found: ${code}`);
                        Quagga.stop();
                        setTimeout(() => onScanSuccess(code), 300);
                    }
                });
            } catch (e) {
                console.error('Quagga load error:', e);
                setStatusMessage('Scanner unavailable. Try uploading an image instead.');
            }
        };

        startQuagga();

        return () => {
            if (quaggaRef.current) {
                try { quaggaRef.current.stop(); } catch (_) {}
                quaggaRef.current = null;
            }
        };
    }, [isOpen, hasNativeDetector, onScanSuccess]);

    // Stop everything when closed
    useEffect(() => {
        if (!isOpen) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
            if (quaggaRef.current) { try { quaggaRef.current.stop(); } catch (_) {} quaggaRef.current = null; }
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full p-0 bg-slate-900 border-slate-700 text-white overflow-hidden shadow-2xl">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                        {useQuagga ? (
                            <div
                                ref={quaggaDivRef}
                                className="w-full h-full"
                                style={{ position: 'relative' }}
                            />
                        ) : (
                            <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
                        )}

                        {detectedBarcodeBox && !useQuagga && (
                            <div className="absolute border-4 border-green-400 rounded-lg transition-all duration-200" style={{
                                left: detectedBarcodeBox.x, top: detectedBarcodeBox.y,
                                width: detectedBarcodeBox.width, height: detectedBarcodeBox.height
                            }} />
                        )}
                        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                            <div className="w-full h-1/3 border-4 border-white/50 rounded-2xl relative">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/70 animate-pulse" />
                            </div>
                        </div>
                        {torchSupported && !useQuagga && (
                            <div className="absolute top-4 right-14 flex flex-col gap-2">
                                <Button variant="ghost" size="icon" onClick={toggleTorch} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                    {isTorchOn ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                </Button>
                            </div>
                        )}
                        {zoomSupported && !useQuagga && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 p-2 rounded-full flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleZoom('out')} className="text-white hover:bg-white/20 rounded-full h-8 w-8"><ZoomOut className="w-5 h-5" /></Button>
                                <span className="text-xs font-mono w-8 text-center">{zoomLevel.toFixed(1)}x</span>
                                <Button variant="ghost" size="icon" onClick={() => handleZoom('in')} className="text-white hover:bg-white/20 rounded-full h-8 w-8"><ZoomIn className="w-5 h-5" /></Button>
                            </div>
                        )}
                    </motion.div>
                </div>
                <div className="p-6 bg-slate-800/50 border-t border-slate-700">
                    <p className="text-center text-slate-300 font-medium">{statusMessage}</p>
                    {useQuagga && <p className="text-center text-slate-500 text-xs mt-1">Using QuaggaJS (fallback scanner)</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10">
                    <X className="w-5 h-5" />
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default LiveScanner;