import React from "react";
import { Link } from "react-router-dom";
import ElementCell from "./ElementCell";

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Door({ cell, title, blurb, items, href, accent }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-8">
      <ElementCell index={cell.idx} symbol={cell.sym} variant={cell.variant} />
      <h3 className="font-heading font-semibold text-[18px] mt-4 mb-2 text-[#0A1F1D]">{title}</h3>
      <p className="text-[14px] text-[#3F4651] mb-4 leading-[1.6]">{blurb}</p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 mb-5 list-none p-0">
        {items.map((t) => (
          <li key={t} className="text-[13px] text-[#2A3338] pl-4 relative">
            <span className="absolute left-0 top-[7px] w-[5px] h-[5px] rounded-full bg-[#5B6168]" />
            {t}
          </li>
        ))}
      </ul>
      <Link to={href} className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: accent }}>
        Explore {cell.variant === "teal" ? "consumer" : "research"} tools <ArrowRight />
      </Link>
    </div>
  );
}

export default function LandingDoors() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-4" aria-label="Ways to work with Suttain">
      <div className="grid gap-8 md:grid-cols-12 border-b border-research-border pb-10">
        <div className="md:col-span-7"><p className="research-label mb-3">For scientists and R&D teams</p><h2 className="mb-3">Autonomous research workflows</h2><p className="text-research-muted mb-4">Search, configure, prepare and track your work in Suttain’s computational studio. Review the files before taking them into your chosen engine or HPC system.</p><Link to="/ResearchDashboard" className="inline-flex min-h-11 items-center gap-2 text-sm text-research-accent hover:underline">Open the research workspace<ArrowRight /></Link></div>
        <div className="md:col-span-5 md:border-l md:border-research-border md:pl-8"><p className="research-label mb-3">For consumers and brands</p><h3 className="mb-3">Make better chemical decisions</h3><p className="text-research-muted mb-4">Scan products, explore interactions, build formulas and assess sustainability, with guidance you can review.</p><a href="#consumer-tools" className="inline-flex min-h-11 items-center gap-2 text-sm text-research-accent hover:underline">Explore consumer tools<ArrowRight /></a></div>
      </div>
    </section>
  );
}