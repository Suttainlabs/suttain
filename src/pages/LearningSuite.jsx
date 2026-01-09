import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PlayCircle, HelpCircle, GraduationCap, Route } from 'lucide-react';
import InteractiveTutorials from '../components/learning/InteractiveTutorials';
import GuidedWalkthroughs from '../components/learning/GuidedWalkthroughs';
import KnowledgeBase from '../components/learning/KnowledgeBase';
import PersonalizedLearningPath from '../components/learning/PersonalizedLearningPath';
import AuthContext from '../components/auth/AuthContext';

export default function LearningSuite() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(user ? 'mypath' : 'tutorials');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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