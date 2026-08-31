import React from "react";
import ElementCell from "./ElementCell";

const NODES = [
  { idx: "A", sym: "Cu", variant: "teal", title: "Someone uses a tool", desc: "A scan, a formula, a simulation, anywhere in the world." },
  { idx: "B", sym: "En", variant: "purple", title: "The engine learns", desc: "Aggregate patterns sharpen the shared safety and formula models." },
  { idx: "C", sym: "Rs", variant: "blue", title: "Research gets rigor", desc: "Formulators and safety teams work from a model tested at real-world scale." },
];

const Arrow = () => (
  <svg width="32" height="16" viewBox="0 0 32 16" fill="none" className="text-[#5B6168]">
    <path d="M0 8h28M22 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function LandingLoop() {
  return (
    <section className="px-6 py-24 bg-[#F7F6F2]">
      <div className="max-w-[640px] mx-auto mb-10 text-center">
        <span className="block font-mono text-xs tracking-[0.04em] text-[#02988C] mb-3">HOW IT FITS TOGETHER</span>
        <h2 className="font-heading font-semibold text-[clamp(24px,3.4vw,32px)] mb-3 text-[#0A1F1D]">One engine, sharpened by use</h2>
        <p className="text-[#4B5563] text-[15.5px]">Consumer and research aren't separate products bolted together. They're one loop.</p>
      </div>
      <div className="max-w-[760px] mx-auto mb-10 flex items-center justify-center gap-0 flex-wrap">
        {NODES.map((n, i) => (
          <React.Fragment key={n.idx}>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-5 py-5 w-[200px] text-center">
              <div className="flex justify-center mb-2.5">
                <ElementCell index={n.idx} symbol={n.sym} variant={n.variant} />
              </div>
              <h5 className="text-[14px] font-semibold mb-1 text-[#0A1F1D]">{n.title}</h5>
              <p className="text-[12.5px] text-[#4B5563] leading-[1.5]">{n.desc}</p>
            </div>
            {i < NODES.length - 1 && (
              <div className="w-12 flex items-center justify-center flex-shrink-0 py-2">
                <Arrow />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="max-w-[640px] mx-auto text-center text-[14.5px] text-[#4B5563] leading-[1.6]">
        Every scan is aggregated, never sold as individual data. A small contribution to a shared,
        growing picture of what's actually in the things we use.
      </p>
    </section>
  );
}