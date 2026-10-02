import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

function joinedCount() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(new Date());
  const value = type => Number(parts.find(part => part.type === type).value);
  // Baseline: 20 on October 2, 2026; add 3 on each monthly anniversary.
  const months = Math.max(0, (value('year') - 2026) * 12 + value('month') - 10 - (value('day') < 2 ? 1 : 0));
  return 20 + months * 3;
}

export default function WaitlistCountBadge() {
  const [count, setCount] = useState(joinedCount);
  useEffect(() => {
    const timer = setInterval(() => setCount(joinedCount()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm text-foreground" aria-live="polite">
      <Users className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <span><span className="font-medium">{count} people</span> have joined as of today</span>
    </div>
  );
}