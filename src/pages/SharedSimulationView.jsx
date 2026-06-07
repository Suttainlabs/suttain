import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Shield, FlaskConical, Leaf, Heart, Zap, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const getSafetyColor = (level) => {
    switch (level) {
        case 'FATAL':
        case 'CRITICAL': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-800' };
        case 'DANGEROUS': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-800' };
        case 'MODERATE': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' };
        case 'LOW': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' };
        default: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' };
    }
};

export default function SharedSimulationView() {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
            setError('No simulation token provided.');
            setLoading(false);
            return;
        }
        loadSimulation(token);
    }, []);

    const loadSimulation = async (token) => {
        try {
            const results = await base44.entities.SharedSimulation.filter({ share_link: token });
            if (!results || results.length === 0) {
                setError('Simulation not found or the link is invalid.');
                return;
            }
            const rec = results[0];
            setRecord(rec);
            // Increment view count silently
            base44.entities.SharedSimulation.update(rec.id, { view_count: (rec.view_count || 0) + 1 }).catch(() => {});
        } catch (err) {
            setError('Failed to load the simulation.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <FlaskConical className="w-12 h-12 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 mb-2">Simulation Not Found</h2>
                <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">{error}</p>
                <Link to="/Simulator">
                    <Button>Run Your Own Simulation</Button>
                </Link>
            </div>
        );
    }

    const data = record.simulation_data || {};
    const risk = data.risk_assessment || {};
    const safety = data.safety_status || {};
    const reaction = data.reaction_details || {};
    const chemicals = data.chemicals || [];
    const color = getSafetyColor(safety.level);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                        alt="Suttain"
                        className="h-9 mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-slate-900">{record.title}</h1>
                    {record.description && (
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">{record.description}</p>
                    )}
                    <p className="text-xs text-slate-400">Shared via Suttain · {record.view_count || 1} view{record.view_count !== 1 ? 's' : ''}</p>
                </div>

                {/* Safety Status */}
                <Card className={`border-2 ${color.border} ${color.bg}`}>
                    <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Safety Level</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-bold ${color.text}`}>{safety.level || 'UNKNOWN'}</span>
                                <Badge className={color.badge}>Risk Score: {risk.overall_risk_score || 0}/100</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                                {chemicals.map(c => c.scientific_name || c.name).join(' + ')}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Health</p>
                                <p className="font-bold text-sm text-slate-800">{risk.health_impact_score || 0}</p>
                            </div>
                            <div>
                                <Leaf className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Env</p>
                                <p className="font-bold text-sm text-slate-800">{risk.environmental_impact_score || 0}</p>
                            </div>
                            <div>
                                <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Reactivity</p>
                                <p className="font-bold text-sm text-slate-800">{risk.reactivity_score || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendation */}
                {risk.recommendation && (
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommendation</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{risk.recommendation}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Reaction Details */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Reaction Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {reaction.balanced_equation && (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-1 font-medium">Balanced Equation</p>
                                <p className="font-mono text-sm text-indigo-700">{reaction.balanced_equation}</p>
                            </div>
                        )}
                        {reaction.what_happens && (
                            <div>
                                <p className="text-xs text-slate-500 mb-1 font-medium">What Happens</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{reaction.what_happens}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Warnings */}
                {safety.warnings?.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Safety Warnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {safety.warnings.map((w, i) => (
                                <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-900">{w}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* CTA */}
                <div className="text-center pt-2 pb-6">
                    <p className="text-xs text-slate-400 mb-3">Powered by Suttain Chemical Safety Platform</p>
                    <Link to="/Simulator">
                        <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Run Your Own Simulation
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}