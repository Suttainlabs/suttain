import { ArrowUpRight } from 'lucide-react';
import { WALKTHROUGH } from '@/components/drug-design/discoveryData';
export default function DiscoveryWalkthrough({ navigate, start }) {
  return <section aria-labelledby="discovery-how-title">
    <h1 id="discovery-how-title" className="mb-2">How Drug Design works</h1>
    <p className="text-muted-foreground mb-5 max-w-2xl">Drug Design brings target research, screening setup, and candidate comparison into a guided workspace. Explore how computational methods can help prioritize molecules for further study. This six-step demonstration uses live target records and illustrative candidate values; it does not replace validated calculations or laboratory experiments.</p>
    <ol className="space-y-3">{WALKTHROUGH.map(item => <li key={item.title}><button onClick={() => navigate(item.view, item.step)} className="w-full text-left border border-border rounded-lg p-4 hover:border-primary"><span className="flex items-center justify-between gap-3 font-medium"><span>{item.title}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></span><span className="block text-sm text-muted-foreground mt-1">{item.body}</span></button></li>)}</ol>
    <p className="text-xs text-muted-foreground mt-5 max-w-2xl">Drug Design searches RCSB PDB, ChEMBL, and UniProt. Candidate scores are illustrative, your shortlist is saved privately, and real job metrics remain at zero until a screening provider is connected.</p>
    <button onClick={start} className="research-primary bg-primary text-primary-foreground mt-5">Start a screening →</button>
  </section>;
}