import React from 'react';
import PremiumFeatureGate from '../components/shared/PremiumFeatureGate';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppWindow, Code, Zap, Lock, BarChart3, Users, Sparkles, CheckCircle, Globe, Server, CloudCog } from 'lucide-react';

export default function EnterpriseAPI() {
  return (
    <PremiumFeatureGate
      featureName="Enterprise API Access"
      featureDescription="Integrate Suttain's data and tools into your enterprise systems."
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {/* Decorative watermarks */}
        <div className="absolute top-40 right-0 w-56 h-56 opacity-5 pointer-events-none hidden lg:block">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/dc994d8c7_closeup-shot-of-a-molecule-structure-on-a-lab-tabl-2026-01-07-23-07-24-utc.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-20 left-0 w-48 h-48 opacity-5 pointer-events-none hidden lg:block">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/fd872eb60_carbon-emissions-to-limit-global-warming-and-clima-2026-01-05-23-25-04-utc.jpg"
            alt=""
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 sm:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center flex-shrink-0">
                    <AppWindow className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                      <h1 className="text-3xl sm:text-4xl font-bold text-white">Enterprise API Access</h1>
                      <Badge className="bg-white/20 text-white border-white/30">Premium</Badge>
                      <Badge className="bg-amber-500 text-white border-amber-400">Coming Soon</Badge>
                    </div>
                    <p className="text-white/90 text-lg max-w-3xl">
                      Seamlessly integrate Suttain's powerful chemical analysis, compliance checking, and sustainability tools into your existing enterprise systems with our robust API.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">RESTful API</h3>
                <p className="text-sm text-slate-600">
                  Modern REST API with comprehensive documentation, SDKs for multiple languages, and webhook support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Real-time Analysis</h3>
                <p className="text-sm text-slate-600">
                  Get instant compliance checks, ingredient analysis, and sustainability scores through API calls.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Secure Authentication</h3>
                <p className="text-sm text-slate-600">
                  Enterprise-grade security with API keys, OAuth 2.0, and role-based access control.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Usage Analytics</h3>
                <p className="text-sm text-slate-600">
                  Monitor API usage, performance metrics, and insights through a dedicated analytics dashboard.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Team Management</h3>
                <p className="text-sm text-slate-600">
                  Manage multiple API keys for different teams, projects, or environments with granular permissions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                  <CloudCog className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">High Availability</h3>
                <p className="text-sm text-slate-600">
                  99.9% uptime SLA with global CDN, auto-scaling, and redundancy across multiple regions.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <Server className="w-6 h-6 text-indigo-600" />
                  API Capabilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Ingredient Analysis</h4>
                      <p className="text-sm text-slate-600">Analyze individual ingredients or complete formulations for safety and compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Compliance Checking</h4>
                      <p className="text-sm text-slate-600">Automated regulatory compliance across multiple regions and markets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Sustainability Scoring</h4>
                      <p className="text-sm text-slate-600">Calculate environmental impact and get eco-friendly recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Chemical Database Access</h4>
                      <p className="text-sm text-slate-600">Search and retrieve data from our comprehensive chemical database</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Batch Processing</h4>
                      <p className="text-sm text-slate-600">Process multiple products or formulations in a single API call</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Document Parsing</h4>
                      <p className="text-sm text-slate-600">Extract ingredient data from SDS sheets and product documentation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Use Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-purple-600" />
                  Enterprise Use Cases
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2">🏭 Manufacturing & R&D</h4>
                    <p className="text-sm text-slate-600">Integrate compliance checking into your product development pipeline before production</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2">🛒 E-commerce Platforms</h4>
                    <p className="text-sm text-slate-600">Automatically validate product listings and display compliance badges to customers</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2">📊 ERP/PLM Systems</h4>
                    <p className="text-sm text-slate-600">Connect your existing systems to automate ingredient tracking and regulatory reporting</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2">🔬 Quality Assurance</h4>
                    <p className="text-sm text-slate-600">Build automated QA workflows with real-time compliance verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Coming Soon</h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                  We're building a powerful Enterprise API that will allow you to integrate Suttain's capabilities directly into your systems. Join our waitlist to get early access and priority onboarding.
                </p>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                  <AppWindow className="w-4 h-4 mr-2" />
                  Join Enterprise Waitlist
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </PremiumFeatureGate>
  );
}