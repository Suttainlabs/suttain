import React, { useState, useCallback, useEffect } from "react";
import { Eye, EyeOff, Trash2, MoreHorizontal, Search, Loader2, ExternalLink, ChevronDown } from "lucide-react";

// ── Style options per layer ──────────────────────────────────────────────────
const STYLE_OPTIONS = ["Cartoon", "Stick", "Ball & Stick", "Sphere", "Line", "Surface"];

const LAYER_STYLE_MAP = {
  Polymer:    { default: "Cartoon",     selector: { hetflag: false } },
  Ligand:     { default: "Ball & Stick", selector: { hetflag: true, resn: ["HOH"], invert: true } },
  Water:      { default: "Ball & Stick", selector: { resn: "HOH" } },
  Ion:        { default: "Sphere",       selector: { resn: ["NA","CL","MG","ZN","CA","K","FE","MN","CU"] } },
  "Unit Cell":{ default: null,           selector: null },
};

function applyLayerStyle(viewer, selector, styleName) {
  if (!viewer || !selector) return;
  viewer.setStyle(selector, {});
  if (!styleName) { viewer.render(); return; }
  const styleObj =
    styleName === "Cartoon"     ? { cartoon: { color: "spectrum" } } :
    styleName === "Stick"       ? { stick: {} } :
    styleName === "Ball & Stick"? { stick: {}, sphere: { scale: 0.3 } } :
    styleName === "Sphere"      ? { sphere: {} } :
    styleName === "Line"        ? { line: {} } :
    styleName === "Surface"     ? { surface: { opacity: 0.7 } } : {};
  viewer.setStyle(selector, styleObj);
  viewer.render();
}

// ── Single layer row ─────────────────────────────────────────────────────────
function LayerRow({ layer, viewerRef, onRemove }) {
  const viewer = viewerRef?.current ?? null;
  const [visible, setVisible] = useState(layer.visible);
  const [style, setStyle] = useState(layer.style);
  const [hovered, setHovered] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  const toggleVisibility = () => {
    const next = !visible;
    setVisible(next);
    if (!viewer || !layer.selector) return;
    if (next) {
      applyLayerStyle(viewer, layer.selector, style);
    } else {
      viewer.setStyle(layer.selector, {});
      viewer.render();
    }
  };

  const focusLayer = () => {
    if (!viewer || !layer.selector) return;
    viewer.zoomTo(layer.selector);
    viewer.render();
  };

  const changeStyle = (s) => {
    setStyle(s);
    setStyleOpen(false);
    if (visible && viewer && layer.selector) {
      applyLayerStyle(viewer, layer.selector, s);
    }
  };

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors relative ${!visible ? "opacity-50" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name + tooltip */}
      <div className="flex-1 min-w-0 relative">
        <button
          onClick={focusLayer}
          title={`${layer.name}. Click to focus.`}
          className="text-sm font-semibold text-teal-700 hover:text-teal-900 truncate text-left w-full"
        >
          {layer.name}
          {layer.extra && <span className="text-xs text-slate-400 ml-1.5 font-normal">{layer.extra}</span>}
        </button>
        {hovered && layer.selector && (
          <div className="absolute left-0 top-full mt-1 z-20 bg-slate-800 text-white text-xs px-2.5 py-1 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
            {layer.name}. Click to focus.
          </div>
        )}
      </div>

      {/* Style selector */}
      {layer.style !== null && (
        <div className="relative">
          <button
            onClick={() => setStyleOpen(v => !v)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            {style}
            <ChevronDown className="w-3 h-3" />
          </button>
          {styleOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[130px]">
              {STYLE_OPTIONS.map(s => (
                <button key={s} onClick={() => changeStyle(s)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-teal-50 hover:text-teal-700 transition-colors ${s === style ? "font-bold text-teal-700" : "text-slate-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visibility */}
      <button onClick={toggleVisibility} className="p-1 rounded hover:bg-slate-100 transition-colors flex-shrink-0" title={visible ? "Hide" : "Show"}>
        {visible
          ? <Eye className="w-4 h-4 text-slate-500 hover:text-slate-800" />
          : <EyeOff className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Delete */}
      <button onClick={() => onRemove(layer.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0" title="Remove layer">
        <Trash2 className="w-4 h-4" />
      </button>

      {/* More options (cosmetic) */}
      <button className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-colors flex-shrink-0">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── RCSB PDB search ──────────────────────────────────────────────────────────
async function searchRCSB(query) {
  const url = `https://search.rcsb.org/rcsbsearch/v2/query?json=${encodeURIComponent(JSON.stringify({
    query: {
      type: "terminal",
      service: "full_text",
      parameters: { value: query }
    },
    return_type: "entry",
    request_options: { paginate: { start: 0, rows: 8 } }
  }))}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.result_set || []).map(r => r.identifier);
}

async function fetchRCSBMeta(pdbId) {
  const res = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`);
  if (!res.ok) return null;
  const d = await res.json();
  return {
    id: pdbId,
    title: d.struct?.title || pdbId,
    resolution: d.refine?.[0]?.ls_d_res_high ? `${d.refine[0].ls_d_res_high} Å` : null,
    method: d.exptl?.[0]?.method || null,
    organism: d.rcsb_entry_container_identifiers?.polymer_entity_ids ? null : null,
  };
}

function PDBSearchPanel({ onLoad }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metas, setMetas] = useState({});

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    const ids = await searchRCSB(query.trim());
    setResults(ids);
    // Fetch metadata in parallel
    const metaMap = {};
    await Promise.all(ids.map(async id => {
      const m = await fetchRCSBMeta(id);
      if (m) metaMap[id] = m;
    }));
    setMetas(metaMap);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="Search RCSB PDB (e.g. insulin, 1CRN, HIV protease)"
          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
        />
        <button onClick={doSearch} disabled={loading}
          className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Search
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {results.map(id => {
            const m = metas[id];
            return (
              <div key={id} className="flex items-start justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-teal-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-700 text-xs">{id}</span>
                    {m?.resolution && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{m.resolution}</span>}
                    {m?.method && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{m.method}</span>}
                  </div>
                  {m?.title && <p className="text-xs text-slate-500 truncate mt-0.5">{m.title}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => onLoad(id)}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg">
                    Load
                  </button>
                  <a href={`https://www.rcsb.org/structure/${id}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <p className="text-xs text-slate-400 text-center py-2">No results. Try a different term or PDB ID.</p>
      )}
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────────────────
export default function PDBLayerPanel({ viewerRef, loadedPdbId, onLoadPdb }) {
  const [layers, setLayers] = useState([
    { id: "polymer",   name: "Polymer",   style: "Cartoon",     visible: true,  selector: { hetflag: false }, extra: null },
    { id: "ligand",    name: "Ligand",    style: "Ball & Stick", visible: true,  selector: { hetflag: true }, extra: null },
    { id: "water",     name: "Water",     style: "Ball & Stick", visible: true,  selector: { resn: "HOH" }, extra: null },
    { id: "unitcell",  name: "Unit Cell", style: null,           visible: false, selector: null, extra: "P 21 21 21" },
  ]);
  const [tab, setTab] = useState("layers"); // "layers" | "search"

  const removeLayer = useCallback((id) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  }, []);

  // When a new PDB loads, reset layers
  React.useEffect(() => {
    if (loadedPdbId) {
      setLayers([
        { id: "polymer",  name: "Polymer",   style: "Cartoon",      visible: true,  selector: { hetflag: false }, extra: null },
        { id: "ligand",   name: "Ligand",    style: "Ball & Stick", visible: true,  selector: { hetflag: true }, extra: null },
        { id: "water",    name: "Water",     style: "Ball & Stick", visible: true,  selector: { resn: "HOH" }, extra: null },
        { id: "unitcell", name: "Unit Cell", style: null,           visible: false, selector: null, extra: null },
      ]);
    }
  }, [loadedPdbId]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 text-sm" style={{ minWidth: 260, maxWidth: 310 }}>
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button onClick={() => setTab("layers")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "layers" ? "bg-teal-50 text-teal-700 border-b-2 border-teal-500" : "text-slate-500 hover:text-slate-700"}`}>
          Layers
        </button>
        <button onClick={() => setTab("search")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${tab === "search" ? "bg-teal-50 text-teal-700 border-b-2 border-teal-500" : "text-slate-500 hover:text-slate-700"}`}>
          <Search className="w-3.5 h-3.5" /> RCSB PDB
        </button>
      </div>

      {tab === "layers" && (
        <div className="flex-1 overflow-y-auto">
          {layers.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">Load a structure to see layers.</p>
          )}
          {layers.map(layer => (
            <LayerRow key={layer.id} layer={layer} viewerRef={viewerRef} onRemove={removeLayer} />
          ))}
          <div className="px-3 py-2 mt-1">
            <p className="text-[10px] text-slate-400">Click a layer name to focus · Eye icon toggles visibility</p>
          </div>
        </div>
      )}

      {tab === "search" && (
        <div className="flex-1 overflow-y-auto p-3">
          <PDBSearchPanel onLoad={(id) => { onLoadPdb(id); setTab("layers"); }} />
          <div className="mt-3 pt-3 border-t border-slate-100">
            <a href="https://www.rcsb.org" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-semibold">
              <ExternalLink className="w-3.5 h-3.5" /> Open RCSB PDB website
            </a>
          </div>
        </div>
      )}
    </div>
  );
}