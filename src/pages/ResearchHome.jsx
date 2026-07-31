import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "../components/shared/SEOHead";
import ResearchNav from "../components/research/ResearchNav";
import ResearchFooter from "../components/research/ResearchFooter";
import ResearchFeatureCards from "../components/research/ResearchFeatureCards";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

export default function ResearchHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Suttain Research — Molecular research, ready to run"
        description="A computational chemistry studio for proteins, small molecules, and materials, real modeling power, not a spreadsheet."
      />
      <ResearchNav />

      <main className="flex-1">
        <section className="page-wrapper content-container max-w-4xl text-center">
          <motion.div {...fade()}>
            <span className="inline-flex items-center rounded-full bg-research-accent-light px-4 py-1.5 text-sm font-medium text-research-accent">
              Built for chemists and scientists
            </span>
          </motion.div>

          <motion.h1 {...fade(0.06)} className="mt-6">
            Molecular research, ready to run
          </motion.h1>

          <motion.p {...fade(0.12)} className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            A computational chemistry studio for proteins, small molecules, and materials, real modeling
            power, not a spreadsheet.
          </motion.p>

          <motion.div {...fade(0.18)} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto bg-research-accent hover:bg-research-accent/90 text-white">
              <Link to="/Pricing">Request research access</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-research-accent text-research-accent hover:bg-research-accent-light">
              <Link to="/ResearchPortal">Browse the tools</Link>
            </Button>
          </motion.div>
        </section>

        <section className="page-wrapper content-container">
          <ResearchFeatureCards />
        </section>
      </main>

      <ResearchFooter />
    </div>
  );
}