import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function NavToolCombobox({ items, label, isActive, accent = '#0F6E56' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter(i => (i.label + ' ' + (i.description || '')).toLowerCase().includes(q))
      : items;
    return filtered.reduce((acc, item) => {
      const cat = item.category || 'Tools';
      (acc[cat] ||= []).push(item);
      return acc;
    }, {});
  }, [items, query]);

  const handleSelect = (href) => {
    setOpen(false);
    setQuery('');
    navigate(createPageUrl(href));
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(''); }}>
      <PopoverTrigger asChild>
        <button className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
          isActive ? "bg-violet-100 text-violet-600" : "text-slate-600 hover:bg-slate-100"
        )}>
          <span>{label}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-3" align="start">
        {/* Compact search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="w-full h-9 pl-8 pr-3 text-sm rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-300 focus:outline-none transition-colors"
          />
        </div>

        {Object.keys(grouped).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No tool found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category} className="contents">
                <div className="col-span-2 pt-2 pb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {category}
                </div>
                {categoryItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="group flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-left hover:bg-slate-50 transition-colors"
                  >
                    <item.icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: accent }}
                    />
                    <span className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}