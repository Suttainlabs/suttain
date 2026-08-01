import React from "react";

// Atelier layout — warm, editorial, high-whitespace experience for individual creators.
// Soft off-white background, rounded container, gentle teal accents.

export default function AtelierLayout({ children }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F7F6F2" }}
    >
      <div className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </div>
    </div>
  );
}