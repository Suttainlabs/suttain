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
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl px-6 py-14 sm:px-14 sm:py-20 relative overflow-hidden">
          {/* Subtle accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
              Ready to create safer products?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Join formulators who trust Suttain for safety, compliance, and sustainability.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link to={createPageUrl("Simulator")}>
                  <Button className="w-full sm:w-auto h-12 px-8 text-[15px] rounded-xl font-semibold bg-[#02988C] hover:bg-[#027d73] text-white">
                    <Sparkles className="w-[18px] h-[18px] mr-2" />
                    Open Simulator
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => openAuthModal("signup")}
                  className="w-full sm:w-auto h-12 px-8 text-[15px] rounded-xl font-semibold bg-[#02988C] hover:bg-[#027d73] text-white"
                >
                  <Sparkles className="w-[18px] h-[18px] mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Link to={createPageUrl("Pricing")}>
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-[15px] rounded-xl font-semibold bg-transparent border-slate-600 text-white hover:bg-white/5">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-7">
              {["No credit card", "14-day trial", "Cancel anytime"].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}