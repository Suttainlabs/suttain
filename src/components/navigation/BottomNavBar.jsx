import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, TestTube, Atom, QrCode, User } from 'lucide-react';

const navItems = [
  { href: 'Home', label: 'Home', icon: Home },
  { href: 'Simulator', label: 'Simulate', icon: TestTube },
  { href: 'generator', label: 'Create', icon: Atom },
  { href: 'BarcodeScanner', label: 'Scan', icon: QrCode },
  { href: 'Profile', label: 'Profile', icon: User },
];

// Check active: Home is active for both '/' and '/Home'
const isNavItemActive = (href, pathname) => {
  if (href === 'Home') return pathname === '/' || pathname === '/Home';
  return pathname === createPageUrl(href);
};

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e, href) => {
    const target = href === 'Home' ? '/' : createPageUrl(href);
    const isActive = isNavItemActive(href, location.pathname);
    if (isActive) {
      e.preventDefault();
      navigate(target, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isNavItemActive(href, location.pathname);
          return (
            <Link
              key={href}
              to={href === 'Home' ? '/' : createPageUrl(href)}
              onClick={(e) => handleNavClick(e, href)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-[var(--suttain-teal)]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}