import { Link, useLocation } from 'react-router-dom';
import { Search, FlaskConical, Microscope, Tag, Mail, Home } from 'lucide-react';

// Branded 404 shown inside the normal site layout. No builder or admin text.
const LINKS = [
  { to: '/', label: 'Home', desc: 'Start from the homepage', icon: Home },
  { to: '/ConsumerPortal', label: 'Consumer & brand tools', desc: 'Scanner, chemical analysis, formula generator', icon: FlaskConical },
  { to: '/research', label: 'Research tools', desc: 'Atomistic simulation and drug design', icon: Microscope },
  { to: '/Pricing', label: 'Pricing', desc: 'Plans for individuals and teams', icon: Tag },
  { to: '/Contact', label: 'Contact us', desc: 'Get help from the Suttain team', icon: Mail },
];

export default function PageNotFound() {
  const location = useLocation();
  const path = location.pathname.length > 60 ? `${location.pathname.slice(0, 60)}…` : location.pathname;

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <p className="text-sm font-medium text-[#02988C]">404</p>
        <h1 className="mt-2 text-3xl font-medium text-slate-900">We couldn't find that page</h1>
        <p className="mt-3 text-slate-600">
          <span className="font-mono text-sm break-all">{path}</span> doesn't exist or has moved.
          Try one of these instead:
        </p>

        <form action="/" method="get" role="search" className="mt-6 flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get('q')?.toString().trim();
          window.location.href = q ? `/?q=${encodeURIComponent(q)}` : '/';
        }}>
          <label htmlFor="notfound-search" className="sr-only">Search chemicals</label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input id="notfound-search" name="q" maxLength={100} placeholder="Search a chemical"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#02988C]" />
          </div>
          <button type="submit" className="h-11 px-4 rounded-lg bg-[#02988C] text-white text-sm font-medium hover:bg-[#027A70]">Search</button>
        </form>

        <ul className="mt-8 divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
          {LINKS.map(({ to, label, desc, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <Icon className="w-4 h-4 text-[#02988C] flex-shrink-0" aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-900">{label}</span>
                  <span className="block text-xs text-slate-500">{desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
