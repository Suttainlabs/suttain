import React, { useEffect, useId, useRef, useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';

// Accessible type-ahead: debounced lookup, results sorted A–Z, arrow keys + Enter to pick.
// `fetchSuggestions(query, signal)` returns [{ id, label, meta }].
export default function SuggestInput({ label, placeholder, fetchSuggestions, onPick, minChars = 2, hint, sourceNote }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [active, setActive] = useState(-1);
  const listId = useId();
  const box = useRef(null);
  const skip = useRef(false);

  useEffect(() => {
    const term = q.trim();
    if (skip.current) { skip.current = false; return; }
    if (term.length < minChars) { setItems([]); setBusy(false); setError(''); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true); setError('');
      try {
        const res = await fetchSuggestions(term, ctrl.signal);
        // Names containing what was typed come first; each group is A–Z.
        const t = term.toLowerCase();
        const az = (a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base', numeric: true });
        const exact = res.filter(r => r.exact || r.label.toLowerCase() === t);
        const others = res.filter(r => !exact.includes(r));
        const hit = others.filter(r => r.label.toLowerCase().includes(t)).sort(az);
        const rest = others.filter(r => !r.label.toLowerCase().includes(t)).sort(az);
        setItems([...exact, ...hit, ...rest]); setActive(-1);
      } catch (e) { if (e.name !== 'AbortError') { setItems([]); setError('Search is unavailable right now. Try again in a moment.'); } }
      finally { if (!ctrl.signal.aborted) setBusy(false); }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, minChars, fetchSuggestions]);

  useEffect(() => {
    const close = e => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pick = item => { skip.current = true; setOpen(false); setItems([]); setQ(item.label); onPick(item); };
  const onKey = e => {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(items[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <label htmlFor={`${listId}-input`} className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-research-muted" aria-hidden="true" />
        <input id={`${listId}-input`} role="combobox" aria-expanded={open && items.length > 0} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => items.length && setOpen(true)} onKeyDown={onKey}
          placeholder={placeholder} autoComplete="off" spellCheck={false} className="simulation-control !h-11 !pl-10 !pr-10 w-full" />
        {busy ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-research-accent" />
          : q && <button type="button" aria-label="Clear" onClick={() => { setQ(''); setItems([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-research-muted hover:bg-research-soft"><X className="h-4 w-4" /></button>}
      </div>
      {hint && <p className="mt-1 text-xs text-research-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
      {open && q.trim().length >= minChars && !busy && (items.length > 0 || !error) && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-research-border bg-research-card shadow-lg">
          {items.length ? (
            <>
              <p className="flex justify-between gap-2 border-b border-research-border px-3 py-1.5 text-[11px] text-research-muted"><span>{items.length} suggestions · best matches first, A–Z</span>{sourceNote && <span>{sourceNote}</span>}</p>
              <ul id={listId} role="listbox" className="max-h-72 overflow-y-auto py-1">
                {items.map((it, i) => (
                  <li key={it.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                    onMouseDown={e => { e.preventDefault(); pick(it); }} onMouseEnter={() => setActive(i)}
                    className={`cursor-pointer px-3 py-2 ${i === active ? 'bg-research-soft' : ''}`}>
                    <span className="block text-sm text-research-text break-words">{it.label}</span>
                    {it.meta && <span className="block text-xs text-research-muted break-words">{it.meta}</span>}
                  </li>
                ))}
              </ul>
            </>
          ) : <p className="px-3 py-3 text-sm text-research-muted">No matches for “{q.trim()}”. Check the spelling or try another name.</p>}
        </div>
      )}
    </div>
  );
}
