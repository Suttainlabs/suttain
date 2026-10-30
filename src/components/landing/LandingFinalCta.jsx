import React from "react";
import { Link } from "react-router-dom";

export default function LandingFinalCta() {
  return (
    <section className="home-final home-container text-center">
      <h2>Choose your workspace.<br />Safer products. Focused research.</h2>
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mt-6"><Link to="/ConsumerPortal" className="home-cta">Explore consumer tools</Link><Link to="/ResearchPortal" className="home-cta">Explore research</Link></div>
    </section>
  );
}