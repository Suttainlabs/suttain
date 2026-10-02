import React from "react";
import { Link } from "react-router-dom";

export default function LandingFinalCta() {
  return (
    <section className="quiet-final quiet-container text-center">
      <h2>Choose your workspace.<br />Two paths. Your next step.</h2>
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mt-6"><Link to="/BarcodeScanner" className="quiet-cta">Try the product scanner</Link><Link to="/ResearchDashboard" className="quiet-cta">Open research dashboard</Link></div>
    </section>
  );
}