import React from "react";
import ElementCell from "./ElementCell";
import Tr from "@/components/i18n/Tr";

const EVERYONE = [
  { idx: "03", sym: "Sn", title: "Scan a product", desc: "Point your camera at a barcode or ingredient list for real chemical identification." },
  { idx: "04", sym: "Ti", title: "Test interactions", desc: "Check whether combining products or ingredients is safe before you mix them." },
  { idx: "05", sym: "Bf", title: "Build a formula", desc: "Generate a validated skincare, soap, or cleaning formula from scratch." },
  { idx: "06", sym: "Ss", title: "Score sustainability", desc: "See how a product or formula stacks up on environmental impact." },
];

const RESEARCH = [
  { idx: "06", sym: "Mi", title: "Molecular intelligence", desc: "Structure, properties, and hazard classification for any compound in the index, queryable, not just searchable." },
  { idx: "07", sym: "Sm", title: "Simulation", desc: "Model reactions and formulations before you run them, with the same safety engine that powers consumer scans." },
  { idx: "08", sym: "Ap", title: "API access", desc: "Bring Suttain's data model, safety engine, and formula intelligence directly into your own tools and pipelines." },
];

function FeatureGrid({ items, variant }) {
  const cols = variant === "research" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`max-w-[960px] mx-auto grid gap-6 ${cols}`}>
      {items.map((f) => (
        <div key={f.idx} className="px-1">
          <ElementCell index={f.idx} symbol={f.sym} variant={variant === "research" ? "purple" : "teal"} />
          <h4 className="font-medium text-[16px] mt-3.5 mb-1.5 text-[#0A1F1D]"><Tr>{f.title}</Tr></h4>
          <p className="text-[14px] text-[#3F4651] leading-[1.6]"><Tr>{f.desc}</Tr></p>
        </div>
      ))}
    </div>
  );
}

function SecHead({ eyebrow, eyebrowColor, title, sub }) {
  return (
    <div className="max-w-[640px] mx-auto mb-12 text-center">
      <span className="block font-mono text-xs tracking-[0.04em] mb-3" style={{ color: eyebrowColor }}><Tr>{eyebrow}</Tr></span>
      <h2 className="font-heading font-semibold text-[clamp(22px,3vw,26px)] mb-3 text-[#0A1F1D]"><Tr>{title}</Tr></h2>
      <p className="text-[#4B5563] text-[15.5px]"><Tr>{sub}</Tr></p>
    </div>
  );
}

export default function LandingFeatures() {
  return (
    <>
      <section className="px-6 py-24">
        <SecHead eyebrow="FOR EVERYONE" eyebrowColor="#027A70" title="Four ways in, one plain-language answer" sub="However you start, you end up knowing for sure." />
        <FeatureGrid items={EVERYONE} variant="consumer" />
      </section>
      <section className="px-6 py-24 bg-[#F7F6F2]">
        <SecHead eyebrow="FOR RESEARCHERS" eyebrowColor="#7D26CC" title="Chemical intelligence, at working depth" sub="The same engine, running at the resolution real chemical work needs." />
        <FeatureGrid items={RESEARCH} variant="research" />
      </section>
    </>
  );
}