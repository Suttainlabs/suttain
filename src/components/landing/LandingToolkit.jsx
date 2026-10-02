import React from "react";
import { Link } from "react-router-dom";
import { ScanLine, Atom, NotebookPen, Globe2 } from 'lucide-react';

const TOOLS = [
  { title: 'Product scanner', desc: 'Ingredient and product safety insights.', to: '/BarcodeScanner', icon: ScanLine },
  { title: 'Chemical simulator', desc: 'Interaction analysis before mixing.', to: '/Simulator', icon: Atom },
  { title: 'Formula generator', desc: 'Ingredient guidance for your next formula.', to: '/generator', icon: NotebookPen },
  { title: 'Research portal', desc: 'A dedicated computational research workspace.', to: '/ResearchPortal', icon: Globe2 }
];

export default function LandingToolkit() {
  return (
    <section id="research-world" className="quiet-toolkit quiet-section scroll-mt-20" aria-labelledby="research-title">
      <div className="quiet-container"><div className="quiet-section-heading"><p className="quiet-eyebrow">Toolkit</p><h2 id="research-title">Real tools, not just an engine</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{TOOLS.map(({ icon: Icon, ...tool }) => <Link key={tool.title} to={tool.to} className="quiet-tool"><div><h3>{tool.title}</h3><p>{tool.desc}</p></div><span className="quiet-tool-icon"><Icon className="h-8 w-8" strokeWidth={1.1} /></span></Link>)}</div>
        <div className="quiet-tool-extras"><Link to="/ComputationalStudio/Simulations">Computational studio</Link><Link to="/ResearchDashboard">Forcefields and run tracking</Link><Link to="/APIPortal">Research API</Link></div>
        <p className="quiet-note">Research inputs need review and separately configured compute.</p>
      </div>
    </section>
  );
}