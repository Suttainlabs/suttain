import React from "react";

// Signature "element cell" motif, styled like a periodic-table entry.
// Variants map to the Suttain pillar palette: teal (consumer), purple (research), blue (data).
const VARIANTS = {
  teal: { border: "#02988C", bg: "#F0FDFA", sym: "#02988C" },
  purple: { border: "#9531F5", bg: "#F5EEFF", sym: "#9531F5" },
  blue: { border: "#09D2FF", bg: "#F0FDFF", sym: "#0A1F1D" },
  ink: { border: "#0A1F1D", bg: "transparent", sym: "#0A1F1D" },
};

export default function ElementCell({ index, symbol, variant = "ink", className = "" }) {
  const v = VARIANTS[variant] || VARIANTS.ink;
  return (
    <span
      className={`inline-flex flex-col justify-center w-[52px] h-[52px] flex-shrink-0 border-[1.5px] rounded-[6px] px-[7px] py-[5px] ${className}`}
      style={{ borderColor: v.border, backgroundColor: v.bg }}
    >
      <span className="font-mono text-[9px] leading-none" style={{ color: "#5B6168" }}>
        {index}
      </span>
      <span
        className="font-heading font-bold text-[19px] leading-none mt-[3px]"
        style={{ color: v.sym }}
      >
        {symbol}
      </span>
    </span>
  );
}