import React from "react";
import SmartChemicalSearch from "@/components/landing/SmartChemicalSearch";

export default function LandingHero() {
  return (
    <section className="px-6 pt-[88px] pb-16 text-center">
      <div className="max-w-[1080px] mx-auto">
        <h1 className="font-heading font-semibold text-[clamp(26px,4vw,34px)] leading-[1.2] tracking-[-0.01em] text-[#0A1F1D] max-w-[760px] mx-auto mb-4">
          One platform. Two ways to work.
        </h1>
        <p className="text-[16px] text-[#3F4651] max-w-[640px] mx-auto mb-9 leading-[1.65]">
          Scan, simulate, and formulate safer products, or run molecular research backed by
          PubChem, ChEMBL, and EPA CompTox. Same engine, either door.
        </p>
        <SmartChemicalSearch />
      </div>
    </section>
  );
}