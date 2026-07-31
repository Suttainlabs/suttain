import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';

export default function ProUpgradeCard({ featureName = 'This feature' }) {
    return (
        <div className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6B3FA0 0%, #4f46e5 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Suttain Pro</span>
                    </div>
                    <p className="font-bold text-base leading-snug mb-1">{featureName} is part of Suttain Pro</p>
                    <p className="text-purple-200 text-sm mb-3">Unlock your biological hydration profile for real-time personalised guidance.</p>
                    <Link to="/Pricing"
                        className="inline-block bg-white text-purple-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                        See Pricing
                    </Link>
                </div>
            </div>
        </div>
    );
}