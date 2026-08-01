import React from "react";

// Lab layout — high-density, dark-slate, professional lab-grade experience for business users.
// Deep slate background, sharp edges, monospace data accents, high information density.

export default function LabLayout({ children }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0D2B22" }}
    >
      <div className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}