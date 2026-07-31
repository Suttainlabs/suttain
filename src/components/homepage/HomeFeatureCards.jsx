import React from 'react';
import { Link } from 'react-router-dom';
import { Beaker, ShieldCheck, ClipboardList } from 'lucide-react';

const CARDS = [
  { icon: Beaker, title: 'Formula builder', desc: 'Build and refine formulas with safety and sustainability scoring built in.', to: '/FormulaBuilder' },
  { icon: ShieldCheck, title: 'Compliance co-pilot', desc: 'Check every ingredient against global regulations before you go to market.', to: '/ComplianceDashboard' },
  { icon: ClipboardList, title: 'Batch records', desc: 'Track lots, expiry dates and batch documentation in one traceable record.', to: '/BatchRecords' },
];

export default function HomeFeatureCards() {
  return (
    <section id="how-it-works" className="page-wrapper">
      <div className="content-container grid grid-cols-1 md:grid-cols-3 grid-gap">
        {CARDS.map(({ icon: Icon, title, desc, to }) => (
          <Link
            key={title}
            to={to}
            className="block bg-white border border-border rounded-2xl card-padding hover:border-core-accent transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-core-accent-light flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-core-accent" />
            </div>
            <h3 className="mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}