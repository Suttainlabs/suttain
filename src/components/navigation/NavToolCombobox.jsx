import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function NavToolCombobox({ items, label, isActive, accent = '#0F6E56' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      const cat = item.category || 'Tools';
      (acc[cat] ||= []).push(item);
      return acc;
    }, {});
  }, [items]);

  const handleSelect = (href) => {
    setOpen(false);
    navigate(createPageUrl(href));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        {Object.keys(grouped).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No tools available.</p>
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