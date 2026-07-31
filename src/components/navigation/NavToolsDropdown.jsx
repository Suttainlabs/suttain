import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Simple click-to-open Tools menu for the same-domain consumer tools.
export default function NavToolsDropdown({ items, label, isActive, accentClass = 'bg-core-accent-light text-core-accent' }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all',
          isActive ? accentClass : 'text-slate-700 hover:bg-slate-100'
        )}>
          <span>{label}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild className="cursor-pointer items-start gap-3 py-2.5">
            <Link to={createPageUrl(item.href)}>
              <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-core-accent" />
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-slate-600 leading-snug">{item.description}</span>
                )}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}