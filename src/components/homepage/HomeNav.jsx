import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LINKS = [
  { label: 'Formula builder', to: '/FormulaBuilder' },
  { label: 'Compliance', to: '/ComplianceDashboard' },
  { label: 'Ingredients', to: '/IngredientDatabase' },
  { label: 'Pricing', to: '/Pricing' },
];

export default function HomeNav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="content-container flex items-center justify-between h-16 px-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
            alt="Suttain"
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-core-accent hover:bg-core-accent-light transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button asChild variant="outline" size="sm">
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    </header>
  );
}