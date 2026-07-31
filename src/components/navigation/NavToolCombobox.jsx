import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { productUrl } from '@/components/auth/productAccess';

export default function NavToolCombobox({ items, label, isActive, product, accentClass = 'bg-violet-100 text-violet-600' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Tools';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
          isActive ? accentClass : "text-slate-600 hover:bg-slate-100"
        )}>
          <span>{label}</span>
          <ChevronsUpDown className="w-3 h-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No tool found.</CommandEmpty>
            {Object.entries(grouped).map(([category, categoryItems]) => (
              <CommandGroup key={category} heading={category}>
                {categoryItems.map((item) => (
                  <CommandItem
                    key={item.path || item.href}
                    value={`${item.label} ${item.description || ''}`}
                    onSelect={() => {
                      setOpen(false);
                      const target = productUrl(product, item.path || createPageUrl(item.href));
                      if (target.startsWith('http')) {
                        window.location.href = target;
                      } else {
                        navigate(target);
                      }
                    }}
                    className="data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-500" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-slate-600 line-clamp-2 leading-snug">{item.description}</div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}