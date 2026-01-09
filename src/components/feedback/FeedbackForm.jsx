
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Star, Send, Sparkles, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Review } from "@/entities/Review";
import { User } from "@/entities/User"; // Added User import

export default function FeedbackForm({ onSubmit }) {
  const [feature, setFeature] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feature || rating === 0) {
      setError("Please select a feature and provide a rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await Review.create({
        feature_used: feature,
        rating,
        feedback: feedback.trim() || null,
        helpful: rating >= 4,
        points_earned: 5 // Changed from 10 to 5 points for general feedback
      });
      
      // Award points to logged-in user
      try {
        const user = await User.me();
        if (user) {
            const newPoints = (user.reward_points || 0) + 5; // Changed from 10 to 5
            await User.updateMyUserData({ reward_points: newPoints });
        }
      } catch (e) {
        // Fail silently if user is not logged in or update fails (e.g., no permissions)
        console.warn("Could not award points. User might not be logged in or an update error occurred:", e);
      }

      // Show success message
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFeature("");
        setRating(0);
        setFeedback("");
        setShowSuccess(false);
        
        // Notify parent component
        if (onSubmit) {
          onSubmit();
        }
      }, 2500); // Increased timeout to let user read the message

    } catch (err) {
      console.error("Error submitting feedback:", err);
      // Check if it's a network error
      if (err.message?.includes('Network Error') || err.code === 'NETWORK_ERROR') {
        setError("Network connection issue. Your feedback couldn't be submitted. Please check your internet connection and try again.");
      } else {
        setError("Failed to submit feedback. Please try again in a moment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-xl">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-800 mb-2">Thank You!</h3>
            <p className="text-emerald-700 mb-4">Your feedback has been submitted successfully.</p>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full border border-amber-200">
                <Award className="w-5 h-5" />
                <span className="font-semibold">You've earned 5 points!</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
          <Star className="w-6 h-6 text-amber-500" />
          Leave a Review
        </CardTitle>
        <p className="text-sm text-slate-600">Share your experience and earn points for future subscriptions!</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="feature" className="text-sm font-semibold">Which Feature?</Label>
            <Select value={feature} onValueChange={setFeature}>
              <SelectTrigger id="feature" className="h-12">
                <SelectValue placeholder="Select the feature you used..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simulator">Chemical Interaction Simulator</SelectItem>
                <SelectItem value="generator">DIY Formula Generator</SelectItem>
                <SelectItem value="scanner">Barcode Scanner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Your Rating</Label>
            <div className="flex gap-1 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  className="p-2"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 transition-all duration-200 ${
                      star <= (hoveredStar || rating)
                        ? "text-amber-400 fill-current drop-shadow-sm"
                        : "text-slate-300"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-slate-600">
                {rating === 5 && "Excellent! ⭐"}
                {rating === 4 && "Very Good! 👍"}
                {rating === 3 && "Good 👌"}
                {rating === 2 && "Could be better 🤔"}
                {rating === 1 && "Needs improvement 😞"}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-sm font-semibold">Your Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="What did you like? What could be improved? Any suggestions?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !feature || rating === 0}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 h-12 text-base font-semibold text-white shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-3" />
                Submit & Earn 5 Points
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
