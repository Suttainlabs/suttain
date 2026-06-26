import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Shield, Atom, Sparkles, Leaf, Zap, CheckCircle, QrCode, Cpu, FlaskConical, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.42 22.49 10.62 22.36 9.84H12.27V14.16H18.15C17.86 15.63 17.07 16.89 15.91 17.68V20.25H19.6C21.56 18.44 22.56 15.63 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12.27 23C15.11 23 17.51 22.09 19.13 20.6L15.91 17.97C14.99 18.62 13.76 19.01 12.27 19.01C9.69 19.01 7.54 17.27 6.74 14.88H2.99V17.56C4.7 20.73 8.19 23 12.27 23Z" fill="#34A853"/>
        <path d="M6.74 14.88C6.5 14.18 6.36 13.45 6.36 12.7C6.36 11.95 6.5 11.22 6.74 10.52V7.84H2.99C2.12 9.54 1.64 11.51 1.64 13.5C1.64 15.49 2.12 17.46 2.99 19.16L6.74 16.48V14.88Z" fill="#FBBC05"/>
        <path d="M12.27 6.49C13.88 6.49 15.22 7.03 16.22 7.96L19.21 4.98C17.51 3.36 15.11 2.36 12.27 2.36C8.19 2.36 4.7 4.63 2.99 7.84L6.74 10.52C7.54 8.13 9.69 6.49 12.27 6.49Z" fill="#EA4335"/>
    </svg>
);

const features = [
    { icon: Shield, text: 'Chemical safety analysis & simulation', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Atom, text: 'AI-powered formula generation', color: 'text-teal-500', bg: 'bg-teal-50' },
    { icon: QrCode, text: 'Product barcode scanner & ingredient scan', color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { icon: Leaf, text: 'Sustainability & eco scoring', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Sparkles, text: 'Compliance co-pilot (50+ regions)', color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: Cpu, text: 'Computational simulations (DFT, MD & more)', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: FlaskConical, text: 'Ingredient database (250k+ chemicals)', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: BarChart2, text: 'Analytics, reports & impact dashboard', color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function AuthModal({ isOpen, onClose, initialMode = "signup", onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        base44.analytics.track({ eventName: 'auth_attempt', properties: { provider: 'google' } });
        window.location.href = '/login';
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Top gradient banner */}
                        <div className="bg-gradient-to-br from-[#02988C] via-[#05b8aa] to-[#09D2FF] px-6 pt-8 pb-10 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="text-center">
                                <img
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                                    alt="Suttain"
                                    className="h-10 w-auto mx-auto mb-4 brightness-0 invert"
                                />
                                <h2 className="text-2xl font-bold text-white">Welcome to Suttain</h2>
                                <p className="text-white/80 text-sm mt-1">Your AI chemical safety platform</p>
                            </div>

                            {/* Floating pill */}
                            <div className="flex items-center justify-center gap-1.5 mt-4">
                                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                                <span className="text-xs font-semibold text-white/90">Free to start — no credit card needed</span>
                            </div>
                        </div>

                        {/* Overlap card */}
                        <div className="px-6 -mt-5">
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 space-y-2">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0`}>
                                            <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
                                        </div>
                                        <span className="text-sm text-slate-700 font-medium">{f.text}</span>
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-6 pt-5 pb-6 space-y-3">
                            <button
                                onClick={handleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 h-12 bg-white border-2 border-slate-200 hover:border-[#02988C] hover:bg-teal-50/50 rounded-2xl font-semibold text-slate-800 transition-all shadow-sm disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-[#02988C] rounded-full animate-spin" />
                                ) : (
                                    <GoogleIcon />
                                )}
                                {isLoading ? 'Redirecting…' : 'Continue with Google'}
                            </button>

                            <p className="text-center text-xs text-slate-400 leading-relaxed">
                                By continuing, you agree to our{' '}
                                <Link to={createPageUrl("TermsOfService")} onClick={onClose} className="underline hover:text-slate-600">Terms</Link>
                                {' '}and{' '}
                                <Link to={createPageUrl("PrivacyPolicy")} onClick={onClose} className="underline hover:text-slate-600">Privacy Policy</Link>.
                                <br />Your data is private and secure.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}