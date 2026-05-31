import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, BookOpen, Mail, Bell, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SEOHead from '@/components/shared/SEOHead';
import { broadcastBlogPost } from '@/functions/broadcastBlogPost';

const MEDIUM_URL = "https://medium.com/@suttain";

const BLOG_IMAGES = {
  waffleTowels: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/7bb6cfd96_clean-waffle-towels-and-other-bath-products-on-woo-2026-01-11-10-51-01-utc.jpg",
  amberBottles: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/f86502577_amber-glass-dropper-bottles-and-cream-jar-on-white-2026-01-07-06-29-24-utc.jpg"
};

export default function Blog() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Inject Soro embed script once on mount
  useEffect(() => {
    if (document.querySelector('script[src*="trysoro.com"]')) return;
    const script = document.createElement('script');
    script.src = 'https://app.trysoro.com/api/embed/39f34335-ade3-4339-96ec-dd251a44a8dc';
    script.defer = true;
    document.body.appendChild(script);
  }, []);



  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      await broadcastBlogPost({ action: 'subscribe', email });
    } catch (err) {
      console.error('Subscription error:', err);
    }
    setSubscribed(true);
    setIsSubscribing(false);

    setTimeout(() => {
      setShowSubscribeModal(false);
      setSubscribed(false);
      setEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead 
        title="Blog | Suttain"
        description="Stay updated with the latest insights on chemical safety, sustainable formulation, and industry trends."
      />

      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-[var(--suttain-teal)]/10 via-white to-[var(--suttain-violet)]/10 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <img 
            src={BLOG_IMAGES.waffleTowels} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-10 pointer-events-none hidden lg:block">
          <img 
            src={BLOG_IMAGES.amberBottles} 
            alt="" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
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

          </motion.div>
        </div>
      </section>

      {/* Soro Blog Embed */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div id="soro-blog"></div>
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