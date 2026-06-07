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
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
            <div className="flex">
                {TABS.map(({ path, label, icon: Icon }) => {
                    const active = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors
                                ${active ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}