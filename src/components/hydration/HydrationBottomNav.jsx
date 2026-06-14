import { Droplets, Brain, Bell, BarChart2 } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const TABS = [
    { path: '/HydrationHome', label: 'Home', icon: Droplets },
    { path: '/HydrationIntelligence', label: 'Insights', icon: Brain },
    { path: '/HydrationReminders', label: 'Reminders', icon: Bell },
    { path: '/HydrationProgress', label: 'Progress', icon: BarChart2 },
];

export default function HydrationBottomNav() {
    const location = useLocation();
    return (
        <div className="sticky top-[64px] z-30 bg-white border-b border-slate-100 shadow-sm">
            <div className="flex overflow-x-auto no-scrollbar max-w-lg mx-auto px-2">
                {TABS.map(({ path, label, icon: Icon }) => {
                    const active = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap
                                ${active
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}