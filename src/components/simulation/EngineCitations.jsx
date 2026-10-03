import React from 'react';
export default function EngineCitations({citations=[]}) {
  if(!citations.length) return null;
  return <section className="rounded-xl border border-research-border bg-research-card p-5 space-y-3"><h3>Software references</h3>{citations.map((c,i)=><div key={i}><p className="text-sm text-research-muted">{c.text || c.title}</p>{c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm underline text-research-accent">Official documentation</a>}</div>)}<p className="text-xs text-research-muted">Also cite the actual installed version, method, basis set, solvent and datasets used; preparation alone does not establish a computed result.</p></section>;
}