import { useEffect } from 'react';

const defaultMeta = {
  title: 'Suttain - AI-Powered Chemical Safety & Formula Generator',
  description: 'Create safe skincare, cleaning products & formulas with AI. Test chemical interactions, scan product barcodes, and get instant safety analysis. 14-day free trial for DIY creators & businesses.',
  keywords: 'chemical safety, formula generator, chemical simulator, skincare formulation, cleaning products, ingredient analysis, product safety, chemical reactions, AI formulation, sustainable products, cosmetic formulation, household cleaners, DIY skincare, chemical database',
  image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png',
  url: 'https://suttain.com',
  type: 'website',
  siteName: 'Suttain',
  twitterHandle: '@suttainlabs'
};

export default function SEOHead({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  article = null,
  noIndex = false 
}) {
  const meta = {
    title: title ? `${title} | Suttain` : defaultMeta.title,
    description: description || defaultMeta.description,
    keywords: keywords || defaultMeta.keywords,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    type: type
  };

  useEffect(() => {
    // Update document title
    document.title = meta.title;

    // Helper to update or create meta tags
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', meta.description);
    setMetaTag('keywords', meta.keywords);
    setMetaTag('author', 'Suttain Labs');
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    setMetaTag('og:title', meta.title, true);
    setMetaTag('og:description', meta.description, true);
    setMetaTag('og:image', meta.image, true);
    setMetaTag('og:url', meta.url, true);
    setMetaTag('og:type', meta.type, true);
    setMetaTag('og:site_name', defaultMeta.siteName, true);
    setMetaTag('og:locale', 'en_US', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', defaultMeta.twitterHandle);
    setMetaTag('twitter:title', meta.title);
    setMetaTag('twitter:description', meta.description);
    setMetaTag('twitter:image', meta.image);

    // Article specific tags
    if (article) {
      setMetaTag('article:published_time', article.publishedTime, true);
      setMetaTag('article:modified_time', article.modifiedTime, true);
      setMetaTag('article:author', article.author, true);
      setMetaTag('article:section', article.section, true);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', meta.url);

  }, [meta.title, meta.description, meta.keywords, meta.image, meta.url, meta.type, noIndex, article]);

  // Add structured data
  useEffect(() => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Suttain",
      "alternateName": "Suttain Labs",
      "url": "https://suttain.com",
      "logo": defaultMeta.image,
      "description": "AI-powered chemical safety and sustainable product formulation platform",
      "sameAs": [
        "https://www.linkedin.com/company/suttainlabs/",
        "https://www.instagram.com/suttainlabs/",
        "https://www.youtube.com/channel/UCOgVoog8K35lkY9VCsNWqAg"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@suttain.com",
        "contactType": "customer service"
      }
    };

    // WebApplication Schema
    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Suttain Chemical Simulator",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "14-day free trial"
      },
      "description": "Test chemical interactions and generate safe product formulas with AI. 14-day free trial.",
      "featureList": [
        "Chemical safety simulation",
        "AI-powered formula generation",
        "Barcode product scanning",
        "Ingredient analysis",
        "Compliance checking",
        "Sustainability scoring"
      ]
    };

    // Software Schema
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Suttain",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "14-day free trial"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
      }
    };

    // Add schemas to document
    const addSchema = (schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    addSchema(organizationSchema);
    addSchema(webAppSchema);
    addSchema(softwareSchema);

    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return null;
}

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: null, // Uses default
    description: 'Create safe skincare, cleaning products & formulas with AI. Test chemical interactions, scan product barcodes, and get instant safety analysis. 14-day free trial for DIY creators & businesses.',
    keywords: 'chemical safety, AI formula generator, chemical simulator, skincare formulation, cleaning products DIY, ingredient safety, product formulation software'
  },
  simulator: {
    title: 'Chemical Safety Simulator',
    description: 'Test chemical combinations safely before mixing. Get instant hazard analysis, reaction predictions, and safety recommendations. AI-powered chemical interaction simulator with 14-day free trial.',
    keywords: 'chemical simulator, chemical reactions, hazard analysis, chemical safety testing, mixing chemicals safely, chemical compatibility'
  },
  generator: {
    title: 'AI Formula Generator',
    description: 'Create professional skincare, soap, and cleaning product formulas with AI. Get ingredient recommendations, safety validation, and step-by-step instructions.',
    keywords: 'formula generator, skincare recipes, soap making, cleaning product formulas, DIY cosmetics, product formulation, AI recipe generator'
  },
  scanner: {
    title: 'Product Barcode Scanner',
    description: 'Scan any product barcode to instantly analyze ingredients. Get safety ratings, allergen alerts, and healthier alternatives for household and personal care products.',
    keywords: 'barcode scanner, ingredient checker, product safety scanner, allergen detector, ingredient analysis app'
  },
  compliance: {
    title: 'AI Compliance Co-Pilot',
    description: 'Automate regulatory compliance checking for cosmetics and household products. Meet FDA, EU, and global standards with AI-powered compliance analysis.',
    keywords: 'regulatory compliance, FDA compliance, EU cosmetics regulation, product compliance, ingredient regulations'
  },
  about: {
    title: 'About Us',
    description: 'Suttain makes chemical safety accessible to everyone with AI-powered tools. Learn about our mission to democratize chemical knowledge for safer products.',
    keywords: 'Suttain company, chemical safety platform, sustainable products, about Suttain'
  },
  learning: {
    title: 'Learning Center',
    description: 'Tutorials and guides on chemical safety, product formulation, and sustainable manufacturing. Learn chemistry basics to advanced formulation techniques.',
    keywords: 'chemistry tutorials, formulation guides, chemical safety training, DIY product making courses'
  }
};