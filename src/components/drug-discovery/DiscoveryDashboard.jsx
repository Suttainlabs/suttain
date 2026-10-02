export default function DiscoveryDashboard({ navigate, start }) {
  return <section aria-labelledby="discovery-dashboard-title">
    <h1 id="discovery-dashboard-title" className="mb-1">Dashboard</h1><p className="text-muted-foreground mb-5">Your screening activity and recent shortlists</p>
    <button onClick={() => navigate('how')} className="w-full text-left mb-5 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm flex flex-col sm:flex-row gap-3 justify-between"><span>New here? See how AI-powered drug discovery works and how this tool walks you through it.</span><span className="text-accent font-medium shrink-0">How it works →</span></button>
    <p className="text-xs font-mono text-muted-foreground mb-3">Example activity — not live account metrics</p>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">{[['3', 'Active screening jobs'], ['18,402', 'Compounds screened (30d)'], ['27', 'Candidates shortlisted'], ['6h 40m', 'Avg. time to shortlist']].map(([number, label]) => <div key={label} className="border border-border rounded-lg p-4"><div className="text-2xl font-medium text-primary">{number}</div><p className="text-xs text-muted-foreground mt-1">{label}</p></div>)}</div>
    <button onClick={start} className="research-primary bg-primary text-primary-foreground">Define a new target →</button>
  </section>;
}