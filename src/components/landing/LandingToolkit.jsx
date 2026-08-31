import React from "react";
import { Link } from "react-router-dom";
import ElementCell from "./ElementCell";
import Tr from "@/components/i18n/Tr";

const TOOLS = [
  { idx: "09", sym: "Sc", variant: "teal", title: "Product scanner", desc: "Scan any product barcode for an instant safety rating and healthier alternatives.", to: "/BarcodeScanner" },
  { idx: "10", sym: "Cs", variant: "teal", title: "Chemical simulator", desc: "Test combinations before you mix them, instant hazard analysis and reaction predictions.", to: "/Simulator" },
  { idx: "11", sym: "Fg", variant: "teal", title: "Formula generator", desc: "Build validated skincare, soap, and cleaning formulas with AI-assisted ingredient selection.", to: "/generator" },
  { idx: "12", sym: "Rp", variant: "purple", title: "Research portal", desc: "Molecular intelligence and computational simulation for professional chemists.", to: "/ResearchPortal" },
];

export default function LandingToolkit() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-[640px] mx-auto mb-12 text-center">
        <span className="block font-mono text-xs tracking-[0.04em] text-[#027A70] mb-3"><Tr>THE TOOLKIT</Tr></span>
        <h2 className="font-heading font-semibold text-[clamp(22px,3vw,26px)] mb-3 text-[#0A1F1D]"><Tr>Real tools, not just an engine</Tr></h2>
        <p className="text-[#3F4651] text-[15px]"><Tr>Four products, one shared chemical intelligence underneath.</Tr></p>
      </div>
      <div className="max-w-[960px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {TOOLS.map((t) => (
          <Link
            key={t.idx}
            to={t.to}
            className="block bg-white border border-[#E5E7EB] rounded-[10px] px-5 py-[22px] transition-colors hover:border-[#02988C]"
          >
            <ElementCell index={t.idx} symbol={t.sym} variant={t.variant} />
            <h4 className="font-medium text-[15px] mt-3.5 mb-1.5 text-[#0A1F1D]"><Tr>{t.title}</Tr></h4>
            <p className="text-[13px] text-[#3F4651] leading-[1.6]"><Tr>{t.desc}</Tr></p>
          </Link>
        ))}
      </div>
    </section>
  );
}