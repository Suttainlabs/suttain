import React from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FreeTrialBanner({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative bg-gradient-to-r from-suttain-teal via-[#06b5a0] to-suttain-blue overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-suttain-purple rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-sm sm:text-base leading-tight">
                Get Started — It's Free!
              </p>
              <p className="text-white/80 text-xs sm:text-sm hidden sm:block">
                Access the Simulator, Formula Generator & Quick Scan — no credit card needed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-3 text-white/90 text-xs">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Unlimited simulations</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Save formulas</span>
              <span className="flex items-center gap-1.5 bg-suttain-purple px-3 py-1.5 rounded-full font-bold text-white text-xs shadow-lg shadow-suttain-purple/40 ring-2 ring-white/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> No credit card required
              </span>
            </div>
            <Link to={createPageUrl("Simulator")}>
              <Button
                size="sm"
                className="bg-white text-suttain-teal hover:bg-white/90 font-bold px-5 rounded-full shadow-lg shadow-black/10"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto text-white/60 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}