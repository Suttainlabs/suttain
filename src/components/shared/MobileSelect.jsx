/**
 * MobileSelect: responsive select component.
 * On mobile (< lg): renders a Drawer (bottom sheet) with option list.
 * On desktop: renders a standard shadcn <Select>.
 */
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * @param {string} value - current value
 * @param {Function} onValueChange - called with new value
 * @param {Array<{value:string, label:string}>} options
 * @param {string} placeholder
 * @param {string} className - extra classes for the trigger
 */
export default function MobileSelect({ value, onValueChange, options = [], placeholder = 'Select…', className = '' }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label;

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm min-h-[44px] ${className}`}
        >
          <span className={selectedLabel ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedLabel || placeholder}
          </span>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{placeholder}</DrawerTitle>
            </DrawerHeader>
            <div className="pb-safe pb-4 px-4 space-y-1 max-h-[60vh] overflow-y-auto">
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onValueChange(opt.value); setOpen(false); }}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors min-h-[44px]"
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}