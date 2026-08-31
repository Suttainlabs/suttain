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
      <h3 className="font-heading font-semibold text-[19px] mt-4 mb-2 text-[#0A1F1D]">{title}</h3>
      <p className="text-[14.5px] text-[#4B5563] mb-4 leading-[1.6]">{blurb}</p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 mb-5 list-none p-0">
        {items.map((t) => (
          <li key={t} className="text-[13px] text-[#0A1F1D] pl-4 relative">
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
    <div className="max-w-[920px] mx-auto px-6 pb-24 grid md:grid-cols-2 gap-5">
      <Door
        cell={{ idx: "01", sym: "Cb", variant: "teal" }}
        title="Consumer and brand"
        blurb="Safer, greener products. Scan products, generate validated formulas, and check compliance, no lab required."
        items={["Scan a product", "Test interactions", "Build a formula", "Score sustainability"]}
        href="/Simulator"
        accent="#02988C"
      />
      <Door
        cell={{ idx: "02", sym: "Rs", variant: "purple" }}
        title="Professional research"
        blurb="Computational chemistry. Simulation, structural biology, and API access for research chemists and scientists."
        items={["Molecule analysis", "Computational studio", "Structural biology", "Research API"]}
        href="/ResearchPortal"
        accent="#9531F5"
      />
    </div>
  );
}