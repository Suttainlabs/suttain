import React from 'react';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useI18n } from './LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { language, changeLanguage, languages, t } = useI18n();

  const current = languages.find(l => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={t('language_label')}
        >
          <Globe className="w-4 h-4" />
          {!compact && <span className="hidden sm:inline">{current.flag}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 max-h-72 overflow-y-auto">
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {t('language_label')}
        </DropdownMenuLabel>
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm font-medium">{lang.label}</span>
            {lang.code === language && <Check className="w-4 h-4 text-[#007850]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}