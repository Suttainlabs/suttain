import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function LandingHero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim() || searching) return;
    setSearching(true);
    setTimeout(() => navigate(`/MoleculeAnalysis?q=${encodeURIComponent(q.trim())}`), 350);
  };

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
        <form
          onSubmit={submit}
          role="search"
          className="max-w-[520px] mx-auto flex gap-2 bg-white border-[1.5px] border-[#0A1F1D] rounded-[9px] p-1.5"
        >
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a chemical, or scan a product barcode"
            aria-label="Search chemicals or scan a product"
            className="flex-1 border-none bg-transparent px-3 py-2.5 text-[15px] text-[#0A1F1D] placeholder:text-[#9a988e] outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={!q.trim() || searching}
            className="bg-[#02988C] text-white rounded-md px-5 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#027A70] flex items-center"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </form>
      </div>
    </section>
  );
}