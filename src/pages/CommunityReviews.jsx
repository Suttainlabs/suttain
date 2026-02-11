import React, { useState, useEffect } from "react";
import { Review } from "@/entities/Review";
import { motion } from "framer-motion";
import { MessageSquare, Star, Users } from "lucide-react";

import FeedbackForm from "../components/feedback/FeedbackForm";
import FeedbackCard from "../components/feedback/FeedbackCard";
import FeedbackStats from "../components/feedback/FeedbackStats";

export default function CommunityReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const fetchedReviews = await Review.list('-created_date', 10); // Show more reviews
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
    loadReviews();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/50 to-blue-50/50 relative overflow-hidden">
      {/* Decorative watermarks */}
      <div className="absolute top-40 left-0 w-48 h-48 opacity-5 pointer-events-none hidden lg:block">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/aefe18831_clay-mask-on-pink-bakground-skincare-product-2026-01-08-05-38-14-utc.jpg"
          alt=""
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div className="absolute bottom-20 right-0 w-56 h-56 opacity-5 pointer-events-none hidden lg:block">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/7bb6cfd96_clean-waffle-towels-and-other-bath-products-on-woo-2026-01-11-10-51-01-utc.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="community-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="3" fill="#9531F5" opacity="0.4"/>
              <circle cx="20" cy="20" r="1.5" fill="#09D2FF" opacity="0.3"/>
              <circle cx="60" cy="60" r="2" fill="#02988C" opacity="0.3"/>
              <circle cx="10" cy="60" r="1" fill="#f59e0b" opacity="0.3"/>
              <circle cx="70" cy="20" r="1" fill="#ef4444" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#community-pattern)"/>
        </svg>
      </div>

      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Users className="w-4 h-4" />
              Community Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Community Reviews & Feedback
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what our community is saying and share your own experience with Suttain's tools.
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
              <div className="sticky top-24">
                <FeedbackForm onSubmit={handleFeedbackSubmitted} />
              </div>
            </div>

            {/* Right column for feedback list - takes 3/5 of width */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[var(--suttain-violet)]" />
                  Community Reviews
                </h2>
                <span className="text-sm text-slate-500">Latest {reviews.length} reviews</span>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-32"></div>
                            <div className="h-3 bg-slate-200 rounded w-20"></div>
                          </div>
                        </div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      </div>
                    </div>
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
                <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-purple-200">
                  <Star className="w-16 h-16 text-purple-300 mx-auto mb-4" />
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
    </div>
  );
}