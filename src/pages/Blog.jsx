import React, { useState, useEffect } from 'react';
import { BookOpen, Mail, Bell, Sparkles } from 'lucide-react';
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

  // Inject Soro embed script after the #soro-blog div is in the DOM
  useEffect(() => {
    // Remove any stale script so it re-runs on navigation back to this page
    const existing = document.querySelector('script[src*="trysoro.com"]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.src = 'https://app.trysoro.com/api/embed/39f34335-ade3-4339-96ec-dd251a44a8dc';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const s = document.querySelector('script[src*="trysoro.com"]');
      if (s) s.remove();
    };
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
    <div className="min-h-screen bg-white">
      <style>{`
        #soro-blog > * + * { margin-top: 1.5rem; }
        #soro-blog article, #soro-blog [class*="card"], #soro-blog [class*="post"] {
          padding: 1.5rem !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
          background: #fff !important;
        }
        #soro-blog img { border-radius: 8px !important; }
      `}</style>
      <SEOHead 
        title="Blog | Suttain"
        description="Stay updated with the latest insights on chemical safety, sustainable formulation, and industry trends."
      />

      {/* Hero Section */}
      <section className="py-20 px-4 text-center border-b border-slate-100">
        <div className="max-w-2xl mx-auto">
          <Badge className="mb-5 bg-[var(--suttain-teal)]/10 text-[var(--suttain-teal)] border-[var(--suttain-teal)]/20 px-3 py-1">
            <BookOpen className="w-3 h-3 mr-1.5" />
            Suttain Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 leading-tight">
            Insights & <span className="gradient-text">Knowledge</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Stay informed with the latest in chemical safety, sustainable formulation, and industry best practices.
          </p>
        </div>
      </section>

      {/* Soro Blog Embed */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div id="soro-blog" className="space-y-6"></div>
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
          
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-4 mt-4">
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
                <Bell className="w-5 h-5 mr-2" />
                {isSubscribing ? 'Subscribing...' : 'Subscribe Now'}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">You're Subscribed!</h3>
              <p className="text-slate-600">Welcome to the Suttain community.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}