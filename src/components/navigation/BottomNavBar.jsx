import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, TestTube, Atom, QrCode, User } from 'lucide-react';

const TABS = [
  { key: 'Home',          label: 'Home',     icon: Home,     root: '/' },
  { key: 'Simulator',     label: 'Simulate', icon: TestTube, root: createPageUrl('Simulator') },
  { key: 'generator',     label: 'Create',   icon: Atom,     root: createPageUrl('generator') },
  { key: 'BarcodeScanner',label: 'Scan',     icon: QrCode,   root: createPageUrl('BarcodeScanner') },
  { key: 'Profile',       label: 'Profile',  icon: User,     root: createPageUrl('Profile') },
];

// Remember the last visited path per tab across renders (persists for the session)
const tabHistory = {};

const getActiveTab = (pathname) => {
  if (pathname === '/' || pathname === '/Home') return 'Home';
  return TABS.find(t => t.key !== 'Home' && pathname.startsWith(t.root))?.key ?? null;
};

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getActiveTab(location.pathname);

  // Keep tab history up to date
  if (activeTab) tabHistory[activeTab] = location.pathname;

  const handleTabPress = (tab) => {
    const isActive = activeTab === tab.key;

    if (isActive) {
      // Re-tap: reset to root and scroll to top
      navigate(tab.root, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Switch to last visited path for that tab, or root
      const dest = tabHistory[tab.key] || tab.root;
      navigate(dest);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden bottom-nav"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabPress(tab)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors inline-touch ${
                isActive
                  ? 'text-[var(--suttain-teal)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}