import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * A floating star-rating toast that appears after using a tool.
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - feature: string  (e.g. "computational", "scanner", "experimentation")
 *  - featureLabel: string  (human label e.g. "Computational Simulation")
 *  - user: user object
 *  - pointsToAward: number (points already awarded for tool use — shown in toast)
 */
export default function ToolFeedbackToast({ isOpen, onClose, feature, featureLabel, user, pointsToAward = 0 }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const handleRate = async (stars) => {
    if (reviewed) return; // Prevent double submission
    setRating(stars);
    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        feature_used: feature,
        rating: stars,
        helpful: stars >= 3,
        points_earned: 5,
      });
      // Award 5 bonus points for leaving feedback
      if (user) {
        await base44.auth.updateMe({ reward_points: (user.reward_points || 0) + 5 });
      }
      setSubmitted(true);
      setReviewed(true);
      setTimeout(onClose, 1800);
    } catch (e) {
      console.error("Failed to submit rating:", e);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 w-80"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-teal-500 via-violet-500 to-cyan-500" />

            <div className="p-4">
              {submitted ? (
                <div className="flex flex-col items-center py-3 gap-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="font-semibold text-slate-800 text-sm">Thanks for your feedback!</p>
                  <p className="text-xs text-slate-500">+5 bonus points awarded 🎉</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{featureLabel}</p>
                      <p className="text-xs text-slate-500">
                        {pointsToAward > 0 && <span className="text-green-600 font-semibold">+{pointsToAward} pts earned · </span>}
                        Rate your experience
                      </p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-500 p-1 -mt-1 -mr-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        disabled={submitting}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110 disabled:opacity-50"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hovered || rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-xs text-slate-400 mt-2">
                    Tap a star to submit · +5 pts for feedback
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}