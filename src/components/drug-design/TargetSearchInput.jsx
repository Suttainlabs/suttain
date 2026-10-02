import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import useTargetSuggestions from '@/components/drug-design/useTargetSuggestions';
export default function TargetSearchInput({ state: s }) {
  const [open, setOpen] = useState(false); const [active, setActive] = useState(-1);
  const { items, loading, unavailable } = useTargetSuggestions(s.query, open);
  const visible = open && s.query.trim().length >= 2;
  function search(value = s.query) { setOpen(false); setActive(-1); s.runSearch(value); }
  function pick(item) { s.setQuery(item.query); search(item.query); }
  function onKeyDown(event) {
    if (event.key === 'Escape') { setOpen(false); setActive(-1); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); setOpen(true);
      if (items.length) setActive(i => event.key === 'ArrowDown' ? (i + 1) % items.length : (i <= 0 ? items.length - 1 : i - 1));
    }
    if (event.key === 'Enter' && visible && active >= 0 && items[active]) { event.preventDefault(); pick(items[active]); }
  }
  return <form onSubmit={e => { e.preventDefault(); search(); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) { setOpen(false); setActive(-1); } }}>
    <label htmlFor="drug-target-query" className="block text-sm mb-2">Find a Drug Design target by disease, gene, or protein</label>
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative flex-1 min-w-0">
        <input id="drug-target-query" role="combobox" aria-autocomplete="list" aria-expanded={visible} aria-controls={visible ? 'drug-target-suggestions' : undefined} aria-activedescendant={visible && items[active] ? `drug-target-suggestion-${active}` : undefined} aria-describedby="drug-target-notes" autoComplete="off" maxLength={200} value={s.query} onFocus={() => setOpen(true)} onChange={e => { s.setQuery(e.target.value); setActive(-1); setOpen(true); }} onKeyDown={onKeyDown} className="simulation-control w-full" placeholder="e.g. EGFR, BACE1, SARS-CoV-2 Mpro" />
        {visible && <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md border border-research-border bg-research-card text-research-text shadow-lg">
          <div className="px-3 py-2 text-xs text-research-muted border-b border-research-border">Suggestions are optional — search any term.</div>
          <ul id="drug-target-suggestions" role="listbox" aria-label="Target suggestions" aria-busy={loading} className="max-h-64 overflow-y-auto overscroll-contain">
            {items.map((item, index) => <li key={`${item.source}-${item.id}`} id={`drug-target-suggestion-${index}`} role="option" aria-selected={index === active} onMouseDown={e => e.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => pick(item)} ref={node => { if (node && index === active) node.scrollIntoView({ block: 'nearest' }); }} className={`cursor-pointer px-3 py-2 border-b last:border-b-0 border-research-border ${index === active ? 'bg-research-soft' : 'hover:bg-research-soft'}`}>
              <span className="block text-sm font-medium break-words">{item.name}</span>
              <span className="block text-xs text-research-muted mt-1">{item.source} · {item.id}{item.organism ? ` · ${item.organism}` : ''}</span>
            </li>)}
          </ul>
          <p role="status" className="px-3 py-2 text-xs text-research-muted">{loading ? 'Looking up suggestions…' : unavailable.length === 2 ? 'Suggestions unavailable. Press Enter or Search to look up your text.' : !items.length ? 'No suggestions found. Press Enter or Search to search all sources.' : `${items.length} suggestions. Choose one or search your own text.`}{!loading && unavailable.length === 1 ? ` ${unavailable[0]} suggestions are unavailable.` : ''}</p>
        </div>}
      </div>
      <button type="submit" onClick={() => setOpen(false)} disabled={s.searching || !s.query.trim()} className="research-primary bg-primary text-primary-foreground disabled:opacity-50">{s.searching && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{s.searching ? 'Searching…' : 'Search'}</button>
    </div>
  </form>;
}