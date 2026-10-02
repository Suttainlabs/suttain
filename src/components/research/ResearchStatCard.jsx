import React from 'react';

export default function ResearchStatCard({ label, value, sub }) {
  return <div className="bg-research-card border border-research-border rounded-xl p-5"><p className="research-label mb-3">{label}</p><p className="font-mono text-2xl text-research-accent">{value}</p>{sub && <p className="text-sm text-research-muted mt-2">{sub}</p>}</div>;
}