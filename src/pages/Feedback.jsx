import React, { useState, useEffect } from "react";
import { Review } from "@/entities/Review";
import { motion } from "framer-motion";
import { MessageSquare, Star } from "lucide-react";

import FeedbackForm from "../components/feedback/FeedbackForm";
import FeedbackCard from "../components/feedback/FeedbackCard";
import FeedbackStats from "../components/feedback/FeedbackStats";

export default function FeedbackPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const fetchedReviews = await Review.list('-created_date', 5); // Limit to top 5
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleFeedbackSubmitted = () => {
    // Reload reviews after a new one is submitted
    loadReviews();
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
            <MessageSquare className="w-8 h-8 text-teal-600" />
            Community Feedback & Reviews
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See what others are saying and share your own experience with our virtual lab tools.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <FeedbackStats reviews={reviews} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column for form - takes 2/5 of width */}
          <div className="lg:col-span-2">
            <FeedbackForm onSubmit={handleFeedbackSubmitted} />
          </div>

          {/* Right column for feedback list - takes 3/5 of width */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Recent Reviews</h2>
              <span className="text-sm text-slate-500">Top 5 recent reviews</span>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-200 h-28 rounded-lg"></div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FeedbackCard review={review} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-200">
                <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-800 mb-2">No reviews yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Be the first to share your feedback and help others discover the power of Suttain!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}