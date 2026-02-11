import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, BookOpen, Calendar, Clock, ArrowRight, 
  X, Mail, Bell, Sparkles, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SEOHead from '@/components/shared/SEOHead';

const MEDIUM_URL = "https://medium.com/@suttainlabs";

// Featured articles from Medium
const FEATURED_ARTICLES = [
  {
    id: 1,
    title: "The Future of Sustainable Chemical Formulation",
    excerpt: "Exploring how modern technology is revolutionizing the way we create safer, eco-friendly products for everyday use.",
    category: "Sustainability",
    readTime: "5 min read",
    date: "Feb 10, 2026",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
    mediumUrl: MEDIUM_URL
  },
  {
    id: 2,
    title: "Understanding Chemical Safety in Household Products",
    excerpt: "A comprehensive guide to identifying harmful ingredients and making informed choices for your family's health.",
    category: "Safety",
    readTime: "7 min read",
    date: "Feb 5, 2026",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop",
    mediumUrl: MEDIUM_URL
  },
  {
    id: 3,
    title: "DIY Skincare: Science-Backed Formulation Tips",
    excerpt: "Learn the fundamentals of creating effective, safe skincare products at home with expert guidance.",
    category: "DIY",
    readTime: "6 min read",
    date: "Jan 28, 2026",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop",
    mediumUrl: MEDIUM_URL
  },
  {
    id: 4,
    title: "Regulatory Compliance: A Guide for Small Businesses",
    excerpt: "Navigate the complex world of cosmetic and cleaning product regulations with our simplified breakdown.",
    category: "Compliance",
    readTime: "8 min read",
    date: "Jan 20, 2026",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
    mediumUrl: MEDIUM_URL
  },
  {
    id: 5,
    title: "Green Chemistry: Principles for a Cleaner Future",
    excerpt: "Discover how green chemistry principles are shaping the next generation of consumer products.",
    category: "Sustainability",
    readTime: "4 min read",
    date: "Jan 15, 2026",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop",
    mediumUrl: MEDIUM_URL
  },
  {
    id: 6,
    title: "Ingredient Spotlight: Natural Preservatives",
    excerpt: "Exploring effective natural alternatives to synthetic preservatives in cosmetic formulations.",
    category: "Ingredients",
    readTime: "5 min read",
    date: "Jan 8, 2026",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=400&fit=crop",
    mediumUrl: MEDIUM_URL
  }
];

const CATEGORIES = ["All", "Sustainability", "Safety", "DIY", "Compliance", "Ingredients"];

export default function Blog() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Show popup after 5 seconds
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('suttain_blog_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowSubscribeModal(true);
        sessionStorage.setItem('suttain_blog_popup_seen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscribed(true);
    setIsSubscribing(false);
    
    setTimeout(() => {
      setShowSubscribeModal(false);
      setSubscribed(false);
      setEmail('');
    }, 2000);
  };

  const filteredArticles = selectedCategory === "All" 
    ? FEATURED_ARTICLES 
    : FEATURED_ARTICLES.filter(a => a.category === selectedCategory);

  const categoryColors = {
    Sustainability: "bg-green-100 text-green-700",
    Safety: "bg-blue-100 text-blue-700",
    DIY: "bg-purple-100 text-purple-700",
    Compliance: "bg-orange-100 text-orange-700",
    Ingredients: "bg-cyan-100 text-cyan-700"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead 
        title="Blog | Suttain"
        description="Stay updated with the latest insights on chemical safety, sustainable formulation, and industry trends."
      />

      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-[var(--suttain-teal)]/10 via-white to-[var(--suttain-violet)]/10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-4 bg-[var(--suttain-teal)]/10 text-[var(--suttain-teal)] border-[var(--suttain-teal)]/20">
              <BookOpen className="w-3 h-3 mr-1" />
              Suttain Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Insights & <span className="gradient-text">Knowledge</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
              Stay informed with the latest in chemical safety, sustainable formulation, and industry best practices.
            </p>
            <a 
              href={MEDIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
            >
              Follow us on Medium
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 px-4 border-b border-slate-200 sticky top-16 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-[var(--suttain-teal)] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <a 
                  href={article.mediumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={categoryColors[article.category]}>
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[var(--suttain-teal)] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <span className="inline-flex items-center text-sm font-medium text-[var(--suttain-teal)] group-hover:gap-2 transition-all">
                        Read on Medium
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>

          {/* View More on Medium */}
          <div className="text-center mt-12">
            <a 
              href={MEDIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              View All Articles on Medium
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <Bell className="w-12 h-12 text-[var(--suttain-blue)] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Never Miss an Update
          </h2>
          <p className="text-slate-300 mb-6">
            Subscribe to our newsletter for the latest articles, tips, and industry insights delivered to your inbox.
          </p>
          <Button
            onClick={() => setShowSubscribeModal(true)}
            className="bg-[var(--suttain-teal)] hover:bg-[var(--suttain-teal)]/90 text-white px-8 py-6 text-lg"
          >
            <Mail className="w-5 h-5 mr-2" />
            Subscribe to Newsletter
          </Button>
        </div>
      </section>

      {/* Subscribe Modal */}
      <Dialog open={showSubscribeModal} onOpenChange={setShowSubscribeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[var(--suttain-teal)] to-[var(--suttain-blue)] rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Stay in the Loop!
            </DialogTitle>
            <DialogDescription className="text-center">
              Get the latest insights on chemical safety, formulation tips, and industry news delivered straight to your inbox.
            </DialogDescription>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubscribe} 
                className="space-y-4 mt-4"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-6"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] py-6"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <span className="flex items-center gap-2">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Bell className="w-5 h-5" />
                      </motion.div>
                      Subscribing...
                    </span>
                  ) : (
                    <>
                      <Bell className="w-5 h-5 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Sparkles className="w-8 h-8 text-green-600" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">You're Subscribed!</h3>
                <p className="text-slate-600">Welcome to the Suttain community.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}