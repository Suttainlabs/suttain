import React from "react";

const PARTNERS = ["PubChem", "ChEMBL", "EPA CompTox", "RCSB PDB"];

export default function LandingTrustBand() {
  return (
    <div className="bg-[#02988C] text-white px-6 py-[52px]">
      <div className="max-w-[1080px] mx-auto flex flex-col items-start gap-6">
        <div className="flex items-center gap-12 flex-wrap">
          <div>
            <div className="font-heading font-bold text-[36px] leading-none whitespace-nowrap">130M+</div>
            <div className="font-mono text-[13px] text-[#D7F5EF] mt-2">CHEMICALS CATALOGUED</div>
          </div>
          <p className="text-[14px] text-[#F2FEFC] max-w-[440px] leading-[1.65] m-0">
            Powered by trusted scientific databases, the same record whether you're checking a
            shampoo bottle or building a claim on it.
          </p>
        </div>
        <div className="flex gap-7 flex-wrap font-mono text-[13px] text-[#D7F5EF] tracking-[0.02em]">
          {PARTNERS.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}