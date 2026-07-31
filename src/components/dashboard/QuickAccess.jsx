import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TestTube, Atom, QrCode, Cpu, BarChart3, Leaf } from 'lucide-react';

const tools = [
    {
        title: 'Simulator',
        description: 'Test chemical interactions',
        icon: TestTube,
        gradient: 'from-[#02988C] to-[#09D2FF]',
        glow: 'hover:shadow-teal-200',
        link: 'Simulator'
    },
    {
        title: 'Formula Generator',
        description: 'Create custom formulas',
        icon: Atom,
        gradient: 'from-[#9531F5] to-purple-400',
        glow: 'hover:shadow-purple-200',
        link: 'generator'
    },
    {
        title: 'Quick Scan',
        description: 'Analyze via barcode',
        icon: QrCode,
        gradient: 'from-sky-500 to-cyan-400',
        glow: 'hover:shadow-cyan-200',
        link: 'BarcodeScanner'
    },
    {
        title: 'Sim Engine',
        description: 'Live formula tuning',
        icon: Cpu,
        gradient: 'from-violet-500 to-indigo-500',
        glow: 'hover:shadow-indigo-200',
        link: 'SimulationEngine'
    },
    {
        title: 'Impact Report',
        description: 'Eco-score benchmark',
        icon: BarChart3,
        gradient: 'from-emerald-500 to-green-400',
        glow: 'hover:shadow-green-200',
        link: 'ComparativeImpactReport'
    },
    {
        title: 'Sustainability',
        description: 'Carbon & eco analysis',
        icon: Leaf,
        gradient: 'from-lime-500 to-emerald-500',
        glow: 'hover:shadow-lime-200',
        link: 'SustainabilityImpact'
    },
];

export default function QuickAccess() {
    return (
        <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Access</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {tools.map((tool) => (
                    <Link to={createPageUrl(tool.link)} key={tool.title} className="group">
                        <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 hover:border-transparent hover:shadow-lg ${tool.glow} transition-all duration-200`}>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${tool.gradient} group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                                <tool.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">{tool.title}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}