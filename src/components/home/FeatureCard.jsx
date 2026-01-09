import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function FeatureCard({ feature, index }) {
  const gradients = {
    0: "accent-gradient",
    1: "warning-gradient"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 glass-card shadow-subtle">
        <CardContent className="p-8">
          <div className={`w-16 h-16 ${gradients[index] || "accent-gradient"} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
            <feature.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-4 tracking-tight">
            {feature.title}
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed font-light">
            {feature.description}
          </p>
          <Link to={feature.link} className="block">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
              {feature.action}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}