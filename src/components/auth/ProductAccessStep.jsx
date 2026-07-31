import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACCESS_OPTIONS } from './productAccess';

export default function ProductAccessStep({ onSubmit, loading, error }) {
  // Selection order matters: the first pick decides the redirect.
  const [selected, setSelected] = useState([]);

  const toggle = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}
      <p className="text-sm text-muted-foreground mb-4">Pick one or more. You can use the others later from your dashboard.</p>
      <div className="space-y-3 mb-6">
        {ACCESS_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);
          const order = selected.indexOf(option.value) + 1;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              aria-pressed={isSelected}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}
            >
              <option.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-xs text-muted-foreground leading-snug">{option.description}</span>
              </span>
              {isSelected && (
                <span className="flex items-center gap-1 text-primary text-xs font-medium flex-shrink-0">
                  {selected.length > 1 && <span>{order}</span>}
                  <Check className="w-4 h-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Button
        className="w-full h-12 font-medium"
        disabled={loading || selected.length === 0}
        onClick={() => onSubmit(selected)}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Setting up your account...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );
}