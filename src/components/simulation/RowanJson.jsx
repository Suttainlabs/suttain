import React,{useState} from 'react';
export default function RowanJson({payload}) {
  const [status,setStatus]=useState(''),text=JSON.stringify(payload,null,2);
  const copy=async () => {try {await navigator.clipboard.writeText(text);setStatus('JSON copied.');}catch{setStatus('Clipboard access was blocked. Use Download JSON.');}};
  return <section className="space-y-3"><div className="flex items-center justify-between gap-3"><h3>Complete stored payload</h3><button onClick={copy} className="research-secondary">Copy JSON</button></div><p role="status" className="text-xs text-research-muted">{status}</p><pre className="max-h-96 overflow-auto p-4 text-xs font-mono">{text}</pre></section>;
}