import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "../components/shared/SEOHead";
import ApiNav from "../components/api/ApiNav";
import ApiFooter from "../components/api/ApiFooter";
import ApiFeatureCards from "../components/api/ApiFeatureCards";
import ApiCodeSample from "../components/api/ApiCodeSample";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

export default function APIHome() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Suttain API — One engine for formula, research, and your product"
        description="The same molecular intelligence behind Formula builder and Research, available to build on."
      />
      <ApiNav />

      <main className="flex-1">
        <section className="page-wrapper content-container max-w-4xl text-center">
          <motion.div {...fade()}>
            <span className="inline-flex items-center rounded-full bg-api-accent-light px-4 py-1.5 text-sm font-medium text-api-accent">
              Built for developers and integrations
            </span>
          </motion.div>

          <motion.h1 {...fade(0.06)} className="mt-6">
            One engine. Formula, research, and your product, all on the same API
          </motion.h1>

          <motion.p {...fade(0.12)} className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The same molecular intelligence behind Formula builder and Research, available to build on.
          </motion.p>

          <motion.div {...fade(0.18)} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto bg-api-accent hover:bg-api-accent/90 text-white">
              <Link to="/Pricing">Get API access</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-api-accent text-api-accent hover:bg-api-accent-light">
              <Link to="/APIPortal">View docs</Link>
            </Button>
          </motion.div>
        </section>

        <section className="page-wrapper content-container">
          <ApiCodeSample />
        </section>

        <section className="page-wrapper content-container">
          <ApiFeatureCards />
        </section>
      </main>

      <ApiFooter />
    </div>
  );
}