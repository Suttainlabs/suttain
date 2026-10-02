import { STEPS } from '@/components/drug-discovery/discoveryData';
import TargetSearchStep from '@/components/drug-discovery/TargetSearchStep';
import LibraryMethodStep from '@/components/drug-discovery/LibraryMethodStep';
import ReviewLaunchStep from '@/components/drug-discovery/ReviewLaunchStep';
export default function ScreeningWizard({ state: s }) {
  return <section aria-labelledby="discovery-screening-title">
    <h1 id="discovery-screening-title" className="mb-5">New screening</h1>
    <ol aria-label="Screening steps" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">{STEPS.map((label, index) => <li key={label}><button onClick={() => s.setStep(index)} aria-current={s.step === index ? 'step' : undefined} className={`w-full flex items-center gap-2 text-left text-sm rounded-lg border p-3 ${index === s.step ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border text-muted-foreground'}`}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-foreground font-mono text-xs">{index + 1}</span>{label}</button></li>)}</ol>
    {s.step === 0 && <TargetSearchStep state={s} />}{s.step === 1 && <LibraryMethodStep state={s} />}{s.step === 2 && <ReviewLaunchStep state={s} />}
  </section>;
}