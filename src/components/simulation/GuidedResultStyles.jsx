import React from 'react';
export default function GuidedResultStyles() {
  return <style>{`
    .guided-result { --research-card:0 0% 100%; --research-text:0 0% 20%; --research-muted:0 0% 40%; --research-border:0 0% 89%; --research-soft:0 0% 97%; --research-accent:153 72% 42%; --guided-outline:153 55% 65%; font-family:var(--font-body); background:hsl(var(--research-card)); color:hsl(var(--research-text)); border:1px solid hsl(var(--research-border)); border-radius:14px; overflow:hidden; }
    .guided-result-layout { display:grid; grid-template-columns: minmax(205px,27.8%) minmax(0,1fr); min-height:600px; }
    .guided-result-navigation { background:hsl(var(--research-soft)); border-right:1px solid hsl(var(--research-border)); padding:64px 22px; display:flex; flex-direction:column; gap:24px; }
    .guided-result-step { display:flex; align-items:center; gap:18px; padding:10px 16px; min-height:44px; text-align:left; border-radius:9px; font-size:16px; line-height:1.45; width:100%; color:hsl(var(--research-text)); }
    .guided-result-step > span:first-child { color:hsl(var(--research-muted)); flex-shrink:0; }
    .guided-result-step.is-current { background:hsl(var(--research-accent)); color:hsl(var(--research-card)); }
    .guided-result-step.is-current > span:first-child { color:inherit; }
    .guided-result-body { min-width:0; padding:136px 34px 64px; }
    .guided-charge > section > h3 { display:none; }
    .guided-result h2,.guided-result h3 { color:hsl(var(--research-text)); font-weight:500; }
    .guided-result h2,.guided-result .guided-energy h3 { font-size:24px; line-height:1.3; }
    .guided-result-intro { font-size:14px; line-height:1.7; color:hsl(var(--research-muted)); margin:8px 0 24px; }
    .guided-result-pagination { display:flex; gap:9px; margin-top:32px; }
    .guided-result-prev,.guided-result-next { display:inline-flex; align-items:center; justify-content:center; gap:6px; border-radius:8px; min-height:40px; padding:8px 14px; font-size:14px; border:1px solid hsl(var(--guided-outline)); }
    .guided-result-prev { color:hsl(var(--research-text)); background:hsl(var(--research-card)); }
    .guided-result-next { color:hsl(var(--research-card)); border-color:hsl(var(--research-accent)); background:hsl(var(--research-accent)); }
    .guided-result-pagination button:disabled { opacity:.4; cursor:not-allowed; }
    .guided-result [hidden] { display:none !important; }
    .guided-energy > section { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.15fr); gap:16px; }
    .guided-energy > section > h3,.guided-energy > section > p { grid-column:1 / -1; margin:0; }
    .guided-energy > section > p { font-size:14px; line-height:1.7; }
    .guided-energy > section > div { margin:4px 0 0 !important; }
    .guided-energy > section > div.h-52 { height:220px; }
    .guided-result table { border-collapse:separate; border-spacing:0; width:100%; }
    .guided-result thead { background:hsl(0 0% 93%); }
    .guided-result th { font-weight:500; font-size:11px; white-space:normal; line-height:1.4; }
    .guided-result td { font-size:11px; }
    .guided-energy > section > div.overflow-auto { border:1px solid hsl(var(--research-border)); border-radius:6px; max-height:260px; }
    .guided-result caption { padding:10px; font-size:10px; caption-side:bottom; }
    .guided-result-metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; border-top:1px solid hsl(var(--research-border)); padding-top:18px; margin-top:24px; }
    .guided-result-metrics dt { font-size:12px; color:hsl(var(--research-muted)); }
    .guided-result-metrics dd { font-size:13px; margin-top:6px; overflow-wrap:anywhere; }
    .guided-result-save > * + * { margin-top:24px; }
    .guided-result-details { border-top:1px solid hsl(var(--research-border)); padding-top:18px; margin-top:24px; font-size:14px; }
    .guided-result-details > summary { cursor:pointer; color:hsl(var(--research-muted)); }
    .guided-result-details > div { margin-top:20px; }
    @media(max-width:767px) { .guided-result-layout { grid-template-columns:1fr; } .guided-result-navigation { padding:16px; flex-direction:row; overflow-x:auto; gap:8px; border-right:0; border-bottom:1px solid hsl(var(--research-border)); } .guided-result-step { width:auto; flex-shrink:0; gap:10px; font-size:14px; } .guided-result-body { padding:32px 20px; } .guided-energy > section { grid-template-columns:1fr; } .guided-result-metrics { gap:10px; } }
  `}</style>;
}