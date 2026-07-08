import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MessageCircle, Camera, CloudSun, ArrowRight, Play, MapPin, Phone, Sun } from 'lucide-react';
import AgroDemoAd from '@/components/agro/AgroDemoAd';

const steps = [
  {
    icon: MapPin,
    title: 'Set Your Location',
    desc: 'Register your farm location and contact details so AgroPocket can provide localized, weather-aware advice.',
    color: '#4A7C2A',
  },
  {
    icon: MessageCircle,
    title: 'Ask Questions',
    desc: 'Chat with the AI agronomist in your language. Ask about crops, soil, pests, or any farming challenge.',
    color: '#2D5016',
  },
  {
    icon: Camera,
    title: 'Diagnose by Photo',
    desc: 'Snap a photo of a diseased leaf or pest. Get an instant diagnosis with recommended treatment actions.',
    color: '#8B6F47',
  },
  {
    icon: CloudSun,
    title: 'Get Weather Alerts',
    desc: 'Receive automated SMS alerts when severe weather threatens your crops, plus irrigation and harvest guidance.',
    color: '#D4A017',
  },
];

export default function AgroPocketLanding() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
            alt="Farmer in field at sunrise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[#F5F1E8]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Sprout className="w-4 h-4 text-[#4A7C2A]" />
            <span className="text-sm font-semibold text-[#2D5016]">AgroPocket</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            AI-Powered Farming Advisor<br />in Your Pocket
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get personalized crop, soil, and weather guidance powered by AI. Designed for smallholder farmers — works on any phone, in your language.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/AgroFarmerProfile"
              className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px] shadow-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[#2D5016] font-semibold px-6 py-4 rounded-xl hover:bg-white transition-colors min-h-[44px]"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D5016] text-center mb-3">What AgroPocket Does</h2>
        <p className="text-center text-[#5B7553] mb-10 max-w-2xl mx-auto">
          Four powerful tools working together to help you make better farming decisions every day.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: MessageCircle, title: 'AI Chat Agronomist', desc: 'Ask any farming question and get expert advice in your local language.', color: '#4A7C2A' },
            { icon: Camera, title: 'Photo Diagnosis', desc: 'Identify crop diseases, pests, and nutrient deficiencies from a single photo.', color: '#8B6F47' },
            { icon: CloudSun, title: 'Weather Alerts', desc: 'Automatic SMS warnings when severe weather threatens your harvest.', color: '#D4A017' },
            { icon: Sprout, title: 'Farm Management', desc: 'Track your crops, soil type, and farm details in one simple profile.', color: '#5B7553' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-[#D4C5B0] p-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.color + '20' }}>
                  <Icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-[#2D5016] mb-2">{item.title}</h3>
                <p className="text-sm text-[#5B7553] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Flowchart */}
      <section className="bg-[#EBE6D6] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D5016] text-center mb-3">How It Works</h2>
          <p className="text-center text-[#5B7553] mb-10 max-w-2xl mx-auto">
            From setup to actionable insights in four simple steps.
          </p>

          <div className="relative">
            {/* Connecting line — desktop */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-[#4A7C2A]/30" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex flex-col items-center text-center">
                    {/* Step number badge */}
                    <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 border-[#F5F1E8]" style={{ backgroundColor: step.color }}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-2 right-1/2 translate-x-8 lg:translate-x-10 w-6 h-6 rounded-full bg-white border-2 border-[#4A7C2A] flex items-center justify-center text-xs font-bold text-[#4A7C2A] z-20">
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-[#2D5016] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#5B7553] leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/AgroFarmerProfile"
              className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px] shadow-lg"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Illustration Section */}
      <section id="demo" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D5016] text-center mb-3">See AgroPocket in Action</h2>
        <p className="text-center text-[#5B7553] mb-8 max-w-2xl mx-auto">
          A farmer chats with the AI agronomist, gets a crop diagnosis, and tracks yield — all from a phone.
        </p>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-[#D4C5B0] bg-[#F5F1E8]">
          <AgroDemoAd />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#2D5016] py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Sun className="w-10 h-10 text-[#D4A017] mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Grow Smarter?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Set up your farm profile in under two minutes and start receiving personalized farming advice today.
          </p>
          <Link
            to="/AgroFarmerProfile"
            className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#5B9C3A] transition-colors min-h-[44px] shadow-lg"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}