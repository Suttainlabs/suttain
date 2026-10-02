import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, FlaskConical } from 'lucide-react';

export default function MobileResearchMenu({ items, isActive, onNavigate }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return <div>
    <button type="button" aria-expanded={open} aria-controls="mobile-research-tools" onClick={() => setOpen(value => !value)} className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-muted ${isActive ? 'bg-accent/10 text-accent' : 'text-foreground'}`}>
      <span className="flex items-center gap-4"><FlaskConical className="w-5 h-5" />Research</span>
      <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    <div id="mobile-research-tools" hidden={!open} className="pl-4 py-1">
      {items.map(item => {
        const path = `/${item.href}`;
        const active = pathname === path || pathname.startsWith(`${path}/`);
        return <Link key={item.href} to={path} aria-current={active ? 'page' : undefined} onClick={() => { setOpen(false); onNavigate(); }} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg border-l-2 transition-colors hover:bg-accent/5 ${active ? 'border-accent bg-accent/10 text-accent' : 'border-transparent text-foreground'}`}>
          <item.icon className="w-4 h-4 shrink-0 text-accent" /><span>{item.label}</span>
        </Link>;
      })}
    </div>
  </div>;
}