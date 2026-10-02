import React from "react";
import { Link } from "react-router-dom";
import ElementCell from "./ElementCell";

const TOOLS = [
  { idx: "09", sym: "Sc", variant: "teal", title: "Product scanner", desc: "Scan any product barcode for an instant safety rating and healthier alternatives.", to: "/BarcodeScanner" },
  { idx: "10", sym: "Cs", variant: "teal", title: "Chemical simulator", desc: "Test combinations before you mix them, instant hazard analysis and reaction predictions.", to: "/Simulator" },
  { idx: "11", sym: "Fg", variant: "teal", title: "Formula generator", desc: "Prepare skincare, soap and cleaning formulas with ingredient guidance and safety checks.", to: "/generator" },
  { idx: "12", sym: "Rp", variant: "teal", title: "Research portal", desc: "Autonomous research workflows with sourced database search, custom forcefields and a unified computational studio.", to: "/ResearchPortal" },
];

export default function LandingToolkit() {
  return (
    <section className="px-4 pb-16 pt-6 sm:px-6 sm:pb-20">
      <div className="max-w-[640px] mx-auto mb-12 text-center">
        <span className="research-label block mb-3">Choose your starting point</span>
        <h2 className="font-heading font-semibold text-[clamp(22px,3vw,26px)] mb-3 text-[#0A1F1D]">Real tools, not just an engine</h2>
        <p className="text-[#3F4651] text-[15px]">Four products, one shared chemical intelligence underneath.</p>
      </div>
      <div className="max-w-[960px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {TOOLS.map((t) => (
          <Link
            key={t.idx}
            to={t.to}
            className="block bg-white border border-[#E5E7EB] rounded-[10px] px-5 py-[22px] transition-colors hover:border-[#02988C]"
          >
            <ElementCell index={t.idx} symbol={t.sym} variant={t.variant} />
            <h4 className="font-medium text-[15px] mt-3.5 mb-1.5 text-[#0A1F1D]">{t.title}</h4>
            <p className="text-[13px] text-[#3F4651] leading-[1.6]">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}