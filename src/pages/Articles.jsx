import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import SEOHead from '@/components/shared/SEOHead';
import { createPageUrl } from '@/utils';

// Holo SEO blog embed. Kept on its own page because the Soro embed on /Blog
// also uses the ?post=<slug> URL parameter; sharing one page breaks direct links.
const HOLO_SRC = 'https://prod-api-holo-ai.fly.dev/public/seo/embed/903b95ba-05ee-4234-b176-ac77ce51e666.js';

export default function Articles() {
  // Inject the Holo script after #holo-blog is in the DOM (React doesn't run <script> tags in JSX)
  useEffect(() => {
    const existing = document.querySelector('script[src*="prod-api-holo-ai.fly.dev"]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.src = HOLO_SRC;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const s = document.querySelector('script[src*="prod-api-holo-ai.fly.dev"]');
      if (s) s.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Articles | Suttain"
        description="Guides from Suttain on product safety, ingredients, barcode scanning and chemical analysis."
      />

      <section className="py-20 px-4 text-center border-b border-slate-100">
        <div className="max-w-2xl mx-auto">
          <Badge className="mb-5 bg-[var(--suttain-teal)]/10 text-[var(--suttain-teal)] border-[var(--suttain-teal)]/20 px-3 py-1">
            <BookOpen className="w-3 h-3 mr-1.5" />
            Suttain Articles
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 leading-tight">
            Guides & <span className="gradient-text">Articles</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Practical guides on product safety, ingredients and chemical analysis.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div id="holo-blog"></div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to={createPageUrl('Blog')} className="inline-flex items-center gap-2 text-[var(--suttain-teal)] font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to the Suttain Blog
          </Link>
        </div>
      </section>
    </div>
  );
}
