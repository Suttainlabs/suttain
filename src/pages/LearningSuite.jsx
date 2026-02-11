import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PlayCircle, HelpCircle, GraduationCap, Route } from 'lucide-react';
import InteractiveTutorials from '../components/learning/InteractiveTutorials';
import GuidedWalkthroughs from '../components/learning/GuidedWalkthroughs';
import KnowledgeBase from '../components/learning/KnowledgeBase';
import PersonalizedLearningPath from '../components/learning/PersonalizedLearningPath';
import AuthContext from '../components/auth/AuthContext';

const LEARNING_IMAGES = {
  essentialOilSoap: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/82e0d0bab_adding-essential-oil-in-soap-base-2026-01-07-07-10-18-utc.jpg",
  carbonEmissions: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/fd872eb60_carbon-emissions-to-limit-global-warming-and-clima-2026-01-05-23-25-04-utc.jpg"
};

export default function LearningSuite() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(user ? 'mypath' : 'tutorials');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative watermark */}
      <div className="absolute bottom-0 left-0 w-80 h-80 opacity-5 pointer-events-none hidden lg:block">
        <img 
          src={LEARNING_IMAGES.essentialOilSoap} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute top-20 right-0 w-64 h-64 opacity-5 pointer-events-none hidden lg:block">
        <img 
          src={LEARNING_IMAGES.carbonEmissions} 
          alt="" 
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            Learning Center
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Chemical Safety Education
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Master chemical safety principles, learn to use the simulator effectively, and access our comprehensive knowledge base.
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${user ? 'grid-cols-4' : 'grid-cols-3'} mb-8 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm`}>
            {user && (
              <TabsTrigger 
                value="mypath" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg py-3"
              >
                <Route className="w-4 h-4" />
                <span className="hidden sm:inline">My</span> Path
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="tutorials" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg py-3"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Interactive</span> Tutorials
            </TabsTrigger>
            <TabsTrigger 
              value="walkthroughs"
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-lg py-3"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Guided</span> Walkthroughs
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg py-3"
            >
              <HelpCircle className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          {user && (
            <TabsContent value="mypath">
              <PersonalizedLearningPath />
            </TabsContent>
          )}

          <TabsContent value="tutorials">
            <InteractiveTutorials />
          </TabsContent>

          <TabsContent value="walkthroughs">
            <GuidedWalkthroughs />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}