import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sun, Moon } from 'lucide-react';

const EnterpriseThemeContext = createContext({ theme: 'dark', toggle: () => {}, colors: {} });
export const useEnterpriseTheme = () => useContext(EnterpriseThemeContext);

const DARK = {
  bg: '#09090b',
  bgElevated: '#131316',
  bgHover: '#1c1c21',
  border: '#27272a',
  borderLight: '#1e1e22',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  accent: '#0D9E8E',
  accentHover: '#0b8a7d',
  accentText: '#5eead4',
  codeBg: '#0d0d0f',
  codeBorder: '#1e1e22',
};

const LIGHT = {
  bg: '#ffffff',
  bgElevated: '#f7f7f8',
  bgHover: '#f0f0f1',
  border: '#e4e4e7',
  borderLight: '#f0f0f0',
  text: '#18181b',
  textMuted: '#52525b',
  textSubtle: '#a1a1aa',
  accent: '#0D9E8E',
  accentHover: '#0b8a7d',
  accentText: '#0D9E8E',
  codeBg: '#f4f4f5',
  codeBorder: '#e4e4e7',
};

export function EnterpriseThemeProvider({ children, defaultTheme = 'dark' }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return localStorage.getItem('suttain_ent_theme') || defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('suttain_ent_theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const colors = theme === 'dark' ? DARK : LIGHT;

  return (
    <EnterpriseThemeContext.Provider value={{ theme, toggle, colors }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      `}</style>
      <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", backgroundColor: colors.bg, color: colors.text, minHeight: '100vh' }}>
        {children}
      </div>
    </EnterpriseThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggle, colors } = useEnterpriseTheme();
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors"
      style={{ borderColor: colors.border, backgroundColor: colors.bgElevated }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" style={{ color: colors.textMuted }} /> : <Moon className="w-4 h-4" style={{ color: colors.textMuted }} />}
    </button>
  );
}

export function MolecularBackground() {
  const { theme } = useEnterpriseTheme();
  const stroke = theme === 'dark' ? '#ffffff' : '#000000';
  const opacity = theme === 'dark' ? 0.035 : 0.05;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <svg width="100%" height="100%" style={{ opacity }}>
        <defs>
          <pattern id="mol-pattern" x="0" y="0" width="180" height="160" patternUnits="userSpaceOnUse">
            {/* Hexagonal ring (benzene) */}
            <polygon points="40,20 64,20 76,42 64,64 40,64 28,42" fill="none" stroke={stroke} strokeWidth="1" />
            <polygon points="46,28 58,28 64,42 58,56 46,56 40,42" fill="none" stroke={stroke} strokeWidth="0.6" />
            {/* Connecting bonds */}
            <line x1="76" y1="42" x2="108" y2="42" stroke={stroke} strokeWidth="1" />
            <line x1="108" y1="42" x2="120" y2="62" stroke={stroke} strokeWidth="1" />
            <line x1="120" y1="62" x2="148" y2="62" stroke={stroke} strokeWidth="1" />
            {/* Second ring */}
            <polygon points="148,48 170,48 180,68 170,88 148,88 138,68" fill="none" stroke={stroke} strokeWidth="1" />
            {/* Vertical connector */}
            <line x1="64" y1="64" x2="64" y2="96" stroke={stroke} strokeWidth="1" />
            <line x1="64" y1="96" x2="40" y2="110" stroke={stroke} strokeWidth="1" />
            <line x1="64" y1="96" x2="88" y2="110" stroke={stroke} strokeWidth="1" />
            {/* Small ring bottom */}
            <polygon points="28,110 46,110 54,124 46,138 28,138 20,124" fill="none" stroke={stroke} strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mol-pattern)" />
      </svg>
    </div>
  );
}

export function MonoCode({ children, className = '' }) {
  const { colors } = useEnterpriseTheme();
  return (
    <code className={className} style={{ fontFamily: "'JetBrains Mono', monospace", color: colors.accentText }}>
      {children}
    </code>
  );
}