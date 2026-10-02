import React from "react";
import ElementCell from "./ElementCell";

const EVERYONE = [
  { idx: "03", sym: "Sn", title: "Scan a product", desc: "Point your camera at a barcode or ingredient list for real chemical identification." },
  { idx: "04", sym: "Ti", title: "Test interactions", desc: "Check whether combining products or ingredients is safe before you mix them." },
  { idx: "05", sym: "Bf", title: "Build a formula", desc: "Prepare a skincare, soap or cleaning formula, then review its ingredients and manufacturing steps." },
  { idx: "06", sym: "Ss", title: "Score sustainability", desc: "See how a product or formula stacks up on environmental impact." },
];



function FeatureGrid({ items, variant }) {
  const cols = variant === "research" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`max-w-[960px] mx-auto grid gap-6 ${cols}`}>
      {items.map((f) => (
        <div key={f.idx} className="px-1">
          <ElementCell index={f.idx} symbol={f.sym} variant={variant === "research" ? "purple" : "teal"} />
          <h4 className="font-medium text-[16px] mt-3.5 mb-1.5 text-[#0A1F1D]">{f.title}</h4>
          <p className="text-[14px] text-[#3F4651] leading-[1.6]">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

function SecHead({ eyebrow, eyebrowColor, title, sub }) {
  return (
    <div className="max-w-[640px] mx-auto mb-12 text-center">
      <span className="block font-mono text-xs tracking-[0.04em] mb-3" style={{ color: eyebrowColor }}>{eyebrow}</span>
      {/* eyebrow uses a darkened pillar tint for AA contrast on white */}
      <h2 className="font-heading font-semibold text-[clamp(22px,3vw,26px)] mb-3 text-[#0A1F1D]">{title}</h2>
      <p className="text-[#4B5563] text-[15.5px]">{sub}</p>
    </div>
  );
}

export default function LandingFeatures() {
  return (
    <section id="consumer-tools" className="px-4 py-12 sm:px-6 sm:py-16 bg-research-card">
      <SecHead eyebrow="03 / Everyday chemical decisions" eyebrowColor="hsl(var(--research-accent))" title="The same care, closer to everyday life" sub="Start with a product, a combination or a formulation. Use the findings to inform your next decision, not replace a safety professional." />
      <FeatureGrid items={EVERYONE} variant="consumer" />
    </section>
  );
}