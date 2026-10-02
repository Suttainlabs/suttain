import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';

export default function LandingDoors() {
  return (
    <section className="quiet-doors quiet-container" aria-label="Choose your Suttain workspace">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
        <article className="quiet-door quiet-consumer">
          <Link to="/BarcodeScanner" aria-label="Open product scanner" className="quiet-door-image"><img src="https://media.base44.com/images/public/688eaf737ea3b621021f8bac/2dc985a43_generated_image.png" alt="Teal ball-and-stick molecular structure on a pale background" fetchPriority="high" width="800" height="1000" /></Link>
          <p className="quiet-audience">For consumers and brands</p>
          <h2>Make better<br />chemical decisions</h2>
          <a href="#consumer-world" className="quiet-door-link">Explore consumer tools<ArrowRight className="h-3.5 w-3.5" /></a>
        </article>
        <article className="quiet-door quiet-research">
          <Link to="/ResearchDashboard" aria-label="Open research dashboard" className="quiet-door-image"><img src="https://media.base44.com/images/public/688eaf737ea3b621021f8bac/e95bbe871_generated_image.png" alt="Sculptural protein ribbon structure on a pale gray background" fetchPriority="high" width="800" height="1000" /></Link>
          <p className="quiet-audience">For scientists and R&amp;D teams</p>
          <h2>Autonomous<br />research workflows</h2>
          <a href="#research-world" className="quiet-door-link">Open the research workspace<ArrowRight className="h-3.5 w-3.5" /></a>
        </article>
      </div>
    </section>
  );
}