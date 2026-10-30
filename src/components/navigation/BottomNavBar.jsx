import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, FlaskConical, User } from 'lucide-react';

// Mobile tab bar: Home · Consumer · Research · Profile.
// `match` decides which tab is highlighted, so every tool page lights up its pillar.
const CONSUMER_PATHS = ['/ConsumerPortal', '/Simulator', '/generator', '/BarcodeScanner', '/SDSAnalyzer', '/CarbonTaxSimulator', '/SustainabilityImpact', '/BulkScan', '/CompareIngredients', '/MobileScan'];
const RESEARCH_PATHS = ['/ResearchPortal', '/ResearchDashboard', '/AtomisticSimulation', '/BindingAndADME', '/SimulationRunner', '/DrugDesign', '/APIPortal', '/ComputationalSimulation'];
const PROFILE_PATHS = ['/Dashboard', '/Profile', '/Settings', '/BillingDashboard', '/Workspace', '/login', '/register'];

const startsWithAny = (pathname, paths) => paths.some(p => pathname === p || pathname.startsWith(`${p}/`));

const TABS = [
  { key: 'home', label: 'Home', icon: Home, root: () => '/', match: p => p === '/' },
  { key: 'consumer', label: 'Consumer', icon: ShoppingBag, root: () => '/ConsumerPortal', match: p => startsWithAny(p, CONSUMER_PATHS) },
  { key: 'research', label: 'Research', icon: FlaskConical, root: () => '/ResearchPortal', match: p => startsWithAny(p, RESEARCH_PATHS) },
  { key: 'profile', label: 'Profile', icon: User, root: user => (user ? '/Dashboard' : '/login'), match: p => startsWithAny(p, PROFILE_PATHS) },
];

// Remember the last visited path per tab for the session, like native tab bars.
const tabHistory = {};

export default function BottomNavBar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const active = TABS.find(tab => tab.match(pathname))?.key ?? null;
  if (active) tabHistory[active] = pathname + location.search;

  const handlePress = tab => {
    if (active === tab.key) {
      navigate(tab.root(user), { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(tabHistory[tab.key] || tab.root(user));
    }
  };

  return (
    <nav aria-label="Primary" className="fixed bottom-0 inset-x-0 z-50 lg:hidden bottom-nav border-t border-slate-200 bg-white/95 backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button key={tab.key} type="button" onClick={() => handlePress(tab)} aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1 transition-colors">
              <span className={`flex items-center justify-center h-8 w-14 rounded-full transition-colors ${isActive ? 'bg-[#02988C]/10 text-[#02988C]' : 'text-slate-500'}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
              </span>
              <span className={`text-xs leading-none ${isActive ? 'font-semibold text-[#02988C]' : 'font-medium text-slate-500'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
