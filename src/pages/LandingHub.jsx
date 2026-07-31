import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import SEOHead from "../components/shared/SEOHead";
import HomeFeatureCards from "../components/home/HomeFeatureCards";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

export default function LandingHub() {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Suttain — Test, generate, and scan your way to a safer formula"
        description="Suttain simulates your formula's safety, generates new ones, and scans ingredients against real regulatory data, before you ever mix a batch."
      />

      {/* Hero */}
      <section className="page-wrapper content-container max-w-4xl text-center hero-offset">
        <motion.div {...fade()}>
          <span className="inline-flex items-center rounded-full bg-core-accent-light px-4 py-1.5 text-sm font-medium text-core-accent">
            Trusted by cosmetics and cleaning brands
          </span>
        </motion.div>

        <motion.h1 {...fade(0.06)} className="mt-6">
          Test, generate, and scan your way to a safer formula
        </motion.h1>

        <motion.p {...fade(0.12)} className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Suttain simulates your formula's safety, generates new ones, and scans ingredients against real
          regulatory data, before you ever mix a batch.
        </motion.p>

        <motion.div {...fade(0.18)} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to={createPageUrl("generator")}>Start building free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link to={createPageUrl("Simulator")}>See how it works</Link>
          </Button>
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="page-wrapper content-container">
        <HomeFeatureCards />
      </section>
    </div>
  );
}