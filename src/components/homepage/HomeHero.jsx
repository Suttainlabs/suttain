import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HomeHero() {
  return (
    <section className="page-wrapper text-center">
      <div className="content-container max-w-3xl">
        <h1 className="mb-4">Formula and compliance tools, built for the brands making them</h1>
        <p className="text-muted-foreground mb-8">
          Build formulas, check compliance, and get to market with confidence
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-core-accent hover:bg-core-accent/90 text-white">
            <Link to="/register">Start building free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-core-accent text-core-accent hover:bg-core-accent-light">
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}