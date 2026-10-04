import { ArrowUpRight } from 'lucide-react';
import { WALKTHROUGH } from '@/components/drug-design/discoveryData';
export default function DiscoveryWalkthrough({ navigate, start }) {
  return <section aria-labelledby="discovery-how-title">
    <h1 id="discovery-how-title" className="mb-2">How Drug Design works</h1>
    <p className="text-muted-foreground mb-5 max-w-2xl">Drug Design brings target research, screening setup, and candidate comparison into a guided workspace. Explore how computational methods can help prioritize molecules for further study. This workflow screens live ChEMBL molecules using JS path fingerprints and estimated molecular properties; it does not replace validated calculations or laboratory experiments.</p>
    <ol className="space-y-3">{WALKTHROUGH.map(item => <li key={item.title}><button onClick={() => navigate(item.view, item.step)} className="w-full text-left border border-border rounded-lg p-4 hover:border-primary"><span className="flex items-center justify-between gap-3 font-medium"><span>{item.title}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></span><span className="block text-sm text-muted-foreground mt-1">{item.body}</span></button></li>)}</ol>
    <p className="text-xs text-muted-foreground mt-5 max-w-2xl">Choose a ChEMBL or UniProt target for screening. Similarity is not binding affinity; property-rule risk is not toxicity or validated ADMET. Your jobs and shortlist are saved privately, and metrics count actual processed compounds.</p>
    <button onClick={start} className="research-primary bg-primary text-primary-foreground mt-5">Start a screening →</button>
  </section>;
}