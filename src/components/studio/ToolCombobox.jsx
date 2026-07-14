import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export default function ToolCombobox({ tools, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = tools.find(t => t.id === value);

  const grouped = tools.reduce((acc, tool) => {
    const cat = tool.category || 'Tools';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {});

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white hover:border-slate-300 transition-colors focus:outline-none focus:border-[#007850]"
        >
          <span className="flex items-center gap-2 min-w-0">
            {selected?.icon && <selected.icon className="w-4 h-4 flex-shrink-0 text-slate-400" />}
            <span className="font-semibold text-slate-700 truncate">
              {selected?.label || 'Select tool...'}
            </span>
          </span>
          <ChevronsUpDown className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tools..." />
          <CommandList>
            <CommandEmpty>No tool found.</CommandEmpty>
            {Object.entries(grouped).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((tool) => (
                  <CommandItem
                    key={tool.id}
                    value={`${tool.label} ${tool.description || ''}`}
                    onSelect={() => { onChange(tool.id); setOpen(false); }}
                    className="flex items-start gap-2 py-2.5"
                  >
                    <Check className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", value === tool.id ? "opacity-100 text-[#007850]" : "opacity-0")} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 truncate">{tool.label}</div>
                      {tool.description && (
                        <div className="text-xs text-slate-500 line-clamp-2 leading-snug">{tool.description}</div>
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