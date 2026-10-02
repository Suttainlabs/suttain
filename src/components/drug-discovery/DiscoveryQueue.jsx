export default function DiscoveryQueue({ state: s }) {
  return <section aria-labelledby="discovery-queue-title">
    <h1 id="discovery-queue-title" className="mb-1">Job queue</h1><p className="text-muted-foreground mb-5">Track your locally simulated screening job</p>
    {!s.jobRunning && !s.jobDone ? <div className="border border-border rounded-lg p-6"><p className="text-muted-foreground mb-4">No screening job yet.</p><button onClick={() => s.navigate('new', 0)} className="research-primary bg-primary text-primary-foreground">Define a target →</button></div> : <div className="border border-border rounded-lg p-4">
      <p className="font-medium break-words">{s.jobTarget?.name || 'Target'} — full screen</p>
      <p role="status" className="text-sm text-muted-foreground mt-1">{s.jobDone ? 'Complete · 4 example candidates available' : 'Running · local demonstration'}</p>
      {s.jobDone ? <button onClick={() => s.navigate('candidates')} className="research-secondary mt-4">View results</button> : <div className="flex items-center gap-3 mt-4"><div role="progressbar" aria-label="Demonstration screening progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.jobProgress} className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${s.jobProgress}%` }} /></div><span className="text-xs font-mono text-muted-foreground">{s.jobProgress}%</span></div>}
    </div>}
  </section>;
}