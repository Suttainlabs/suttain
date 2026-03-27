import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import AuthContext from "../auth/AuthContext";

export default function FinalCTA() {
  const { user, openAuthModal } = useContext(AuthContext);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Accent orbs */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500 rounded-full blur-3xl opacity-10" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-violet-500 rounded-full blur-3xl opacity-10" />

          <div className="relative px-8 py-14 sm:px-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to Create
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Safer Products?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of formulators who trust Suttain for chemical safety, compliance, and sustainable product development.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to={createPageUrl("Simulator")}>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-10 py-6 text-base rounded-xl font-semibold shadow-lg shadow-teal-500/25 border-0">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Open Simulator
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={() => openAuthModal("signup")}
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-10 py-6 text-base rounded-xl font-semibold shadow-lg shadow-teal-500/25 border-0"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              <Link to={createPageUrl("Pricing")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white hover:bg-white/10 px-10 py-6 text-base rounded-xl font-semibold">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
              {["No credit card required", "14-day free trial", "Cancel anytime"].map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-slate-400">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}