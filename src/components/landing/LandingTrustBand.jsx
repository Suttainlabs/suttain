import React from "react";

const PARTNERS = ["PubChem", "ChEMBL", "EPA CompTox", "RCSB PDB"];

export default function LandingTrustBand() {
  return (
    <div className="bg-[#02988C] text-white px-6 py-16">
      <div className="max-w-[640px] mx-auto flex flex-col items-center text-center gap-8">
        <div>
          <div className="font-heading font-bold text-[40px] leading-none">130M+</div>
          <div className="font-mono text-[12px] tracking-[0.12em] text-[#D7F5EF] mt-3 uppercase">
            Chemicals catalogued
          </div>
        </div>

        <p className="text-[15px] text-[#F2FEFC] max-w-[480px] leading-[1.65] m-0">
          Powered by trusted scientific databases, the same record whether you're
          checking a shampoo bottle or building a claim on it.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 border-t border-white/15 w-full max-w-[480px] mt-1 pt-5">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="font-mono text-[12.5px] tracking-[0.04em] text-[#EAFBF7]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}