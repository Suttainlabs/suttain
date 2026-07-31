import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ACCESS_OPTIONS, buildAccessRedirect } from '@/components/auth/productAccess';

// Shows every product the user selected at signup so the ones they did not
// land on after signup are still one click away.
export default function MyProductsCard({ user }) {
  const access = Array.isArray(user?.product_access) ? user.product_access : [];
  if (access.length < 2) return null;

  const options = access
    .map((value) => ACCESS_OPTIONS.find((o) => o.value === value))
    .filter(Boolean);

  return (
    <div className="content-container px-4 pt-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-base font-medium mb-1">Your Suttain products</h2>
        <p className="text-sm text-slate-500 mb-4">Switch to any of the areas you signed up for.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((option) => (
            <a
              key={option.value}
              href={buildAccessRedirect(option.value)}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <option.icon className="w-4 h-4 flex-shrink-0 text-core-accent" />
              <span className="text-sm font-medium text-slate-700 flex-1 min-w-0 truncate">
                {option.label}
              </span>
              <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}