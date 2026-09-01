import React from "react";

// Lab layout: high-density, professional lab-grade experience for business users.
// Dark "terminal" chrome frame on top with a light content canvas below, so the
// existing light-themed step components render correctly while preserving the lab aesthetic.

export default function LabLayout({ children }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0D2B22" }}
    >
      {/* Lab terminal chrome bar */}
      <div className="border-b border-[#0F6E56]/40 bg-[#163D2F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-[#00B478]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00B478]" />
            Formulation Terminal
          </div>
          <div className="font-mono text-[10px] sm:text-xs text-[#B8D0C5]">
            GMP / Multi-region compliance
          </div>
        </div>
      </div>

      {/* Light content canvas, keeps step components legible */}
      <div className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8 bg-[#F7F6F2] min-h-[calc(100vh-2.5rem)]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}