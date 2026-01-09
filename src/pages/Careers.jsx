
import React, { useState, useEffect } from 'react';
import { JobPosting } from '@/entities/JobPosting';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Briefcase, ChevronDown, Target, Lightbulb, 
  TrendingUp, Globe, Loader2, Linkedin, ArrowRight, Link2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultOpenJob, setDefaultOpenJob] = useState(null);
  const [copiedJobId, setCopiedJobId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get('jobId');
    if (jobId) {
      setDefaultOpenJob(`item-${jobId}`);
    }
  }, [location.search]);

  useEffect(() => {
    if (defaultOpenJob && jobs.length > 0) {
      const jobId = defaultOpenJob.replace('item-', '');
      const element = document.getElementById(`job-${jobId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300); // Small delay to ensure the accordion has opened
      }
    }
  }, [defaultOpenJob, jobs]);

  // Effect to manage dynamic meta tags for social sharing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get('jobId');
    let specificJob = null;

    if (jobId && jobs.length > 0) {
      specificJob = jobs.find(j => j.id.toString() === jobId);
    }

    const setMetaTag = (property, content) => {
      let element = document.querySelector(`meta[property='${property}']`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Define default meta tag content
    const defaultTitle = "Careers at Suttain";
    const defaultDesc = "Join our mission to build the future of sustainable innovation. We're looking for passionate, curious, and driven individuals to help us on our mission.";
    const defaultImage = `${window.location.origin}/images/suttain-careers-banner.jpg`; // A default banner for the careers page
    const defaultUrl = `${window.location.origin}${createPageUrl('Careers')}`;

    if (specificJob) {
        const jobUrl = `${defaultUrl}?jobId=${specificJob.id}`;
        
        // Create a temporary div to strip HTML tags from the description
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = specificJob.description;
        const cleanDescription = (tempDiv.textContent || tempDiv.innerText || "").trim();
        const shortDescription = cleanDescription.substring(0, 160) + (cleanDescription.length > 160 ? '...' : '');

        // Set page title and Open Graph meta tags for the specific job
        document.title = `${specificJob.title} | Suttain Careers`;
        setMetaTag('og:title', `${specificJob.title} at Suttain`);
        setMetaTag('og:description', shortDescription);
        setMetaTag('og:url', jobUrl);
        setMetaTag('og:type', 'article'); // Indicates the page is an article (job post)
    } else {
        // Set page title and Open Graph meta tags for the general careers page
        document.title = defaultTitle;
        setMetaTag('og:title', defaultTitle);
        setMetaTag('og:description', defaultDesc);
        setMetaTag('og:url', defaultUrl);
        setMetaTag('og:type', 'website'); // Indicates the page is a general website
    }
    setMetaTag('og:image', defaultImage); // Always use a default image for the careers page

    // Cleanup function to reset the document title on component unmount
    return () => {
      document.title = "Suttain"; // Or your default site title
      // Optionally remove dynamic meta tags, though usually not strictly necessary
    };
  }, [jobs, location.search]); // Depend on jobs to ensure specificJob is found, and location.search for URL changes
  
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // Explicitly filter for jobs with 'open' status for public visibility.
        // This is a more robust way to ensure only open positions are fetched on this page.
        const openJobs = await JobPosting.filter({ status: 'open' }, '-created_date');
        setJobs(openJobs);
      } catch (error) {
        console.error("Failed to fetch job postings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleShare = (job) => {
    const jobUrl = `${window.location.origin}${createPageUrl('Careers')}?jobId=${job.id}`;
    const shareText = `Check out this exciting opportunity at Suttain: ${job.title}!`;
    // Note: LinkedIn primarily uses OG tags, but including a title might help other platforms.
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
    window.open(linkedInShareUrl, '_blank', 'width=600,height=600,noopener,noreferrer');
  };

  const handleCopyLink = (job) => {
    const jobUrl = `${window.location.origin}${createPageUrl('Careers')}?jobId=${job.id}`;
    navigator.clipboard.writeText(jobUrl).then(() => {
      setCopiedJobId(job.id);
      setTimeout(() => setCopiedJobId(null), 2500); // Reset after 2.5 seconds
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/9c87bec3d_premium_photo-1677529496297-fd0174d65941.png"
          alt="A collaborative team working at Suttain"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent"></div>
        
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Shape the Future With Us
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              At Suttain, we're building the future of sustainable innovation. We're looking for passionate, curious, and driven individuals to join our mission.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Suttain Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900">Why Join Suttain?</h2>
          <p className="text-center mt-4 max-w-3xl mx-auto text-slate-600">
            We're not just building a product; we're building a movement towards a safer and more sustainable future. By joining us, you'll be part of a team that's making a real-world impact.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100">
                <Target className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Make an Impact</h3>
              <p className="text-sm text-slate-600">Work on cutting-edge AI that directly contributes to a safer, more sustainable world.</p>
            </div>
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100">
                <Lightbulb className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Innovative Culture</h3>
              <p className="text-sm text-slate-600">Join a collaborative environment where scientific curiosity and technological innovation thrive.</p>
            </div>
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100">
                <TrendingUp className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Growth & Learning</h3>
              <p className="text-sm text-slate-600">Be part of a foundational team with immense opportunities for professional growth.</p>
            </div>
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
                <Globe className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Flexible & Remote</h3>
              <p className="text-sm text-slate-600">We champion a flexible work culture that values results and work-life balance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Current Openings</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--suttain-teal)]" />
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full" defaultValue={defaultOpenJob} key={defaultOpenJob}>
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AccordionItem value={`item-${job.id}`} id={`job-${job.id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border">
                      <AccordionTrigger className="p-6 text-left hover:no-underline">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[var(--suttain-teal)]">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
                            {job.department && <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{job.department}</div>}
                            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</div>
                            <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.type}</div>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                      </AccordionTrigger>
                      <AccordionContent className="p-6 pt-0">
                        <div className="prose max-w-none prose-slate prose-headings:font-semibold prose-headings:text-slate-800 prose-ul:list-disc prose-ol:list-decimal prose-strong:font-semibold">
                          <h4 className="font-semibold">Description</h4>
                          <div dangerouslySetInnerHTML={{ __html: job.description }} />
                          <h4 className="mt-4 font-semibold">Requirements</h4>
                          <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4">
                            {job.application_url && (
                                <Button asChild className="bg-[var(--suttain-violet)] hover:bg-[#8125d9]">
                                <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => handleShare(job)}>
                                <Linkedin className="w-4 h-4 mr-2" />
                                Share on LinkedIn
                            </Button>
                            <Button variant="outline" onClick={() => handleCopyLink(job)}>
                              {copiedJobId === job.id ? (
                                <>
                                  <Check className="w-4 h-4 mr-2 text-green-500" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-4 h-4 mr-2" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border-2 border-dashed">
              <h3 className="text-xl font-semibold text-slate-800">No Open Positions Currently</h3>
              <p className="text-slate-500 mt-2">
                We're always looking for talented people. Check back soon or follow us on social media for updates.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
