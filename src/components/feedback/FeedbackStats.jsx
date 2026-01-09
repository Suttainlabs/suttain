
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, MessageSquare, TrendingUp, QrCode } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedbackStats({ reviews }) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const simulatorReviews = reviews.filter(r => r.feature_used === 'simulator');
  const generatorReviews = reviews.filter(r => r.feature_used === 'generator');
  const scannerReviews = reviews.filter(r => r.feature_used === 'scanner');
  
  const simulatorAvgRating = simulatorReviews.length > 0
    ? (simulatorReviews.reduce((acc, r) => acc + r.rating, 0) / simulatorReviews.length).toFixed(1)
    : 'N/A';

  const generatorAvgRating = generatorReviews.length > 0
    ? (generatorReviews.reduce((acc, r) => acc + r.rating, 0) / generatorReviews.length).toFixed(1)
    : 'N/A';
  
  const scannerAvgRating = scannerReviews.length > 0
    ? (scannerReviews.reduce((acc, r) => acc + r.rating, 0) / scannerReviews.length).toFixed(1)
    : 'N/A';

  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const satisfactionRate = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;

  const stats = [
    {
      label: "Overall Rating",
      value: averageRating,
      icon: Star,
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    {
      label: "Total Reviews", 
      value: totalReviews,
      icon: MessageSquare,
      color: "from-sky-400 to-cyan-500",
      bgColor: "bg-sky-50",
      textColor: "text-sky-700"
    },
    {
      label: "Simulator Avg.",
      value: simulatorAvgRating,
      icon: TrendingUp,
      color: "from-teal-400 to-teal-500", 
      bgColor: "bg-teal-50",
      textColor: "text-teal-700"
    },
    {
      label: "Generator Avg.",
      value: generatorAvgRating,
      icon: Users,
      color: "from-violet-400 to-purple-500",
      bgColor: "bg-violet-50", 
      textColor: "text-violet-700"
    },
    {
      label: "Scanner Avg.",
      value: scannerAvgRating,
      icon: QrCode,
      color: "from-cyan-400 to-sky-500",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Community Statistics</h2>
        <p className="text-slate-600">Real feedback from our users</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                  {stat.value}
                  {stat.label.includes("Rating") || stat.label.includes("Avg") ? (
                    stat.value !== 'N/A' && <span className="text-sm">/5</span>
                  ) : null}
                </p>
                <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {totalReviews > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-full border border-emerald-200">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {satisfactionRate}% satisfaction rate
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
