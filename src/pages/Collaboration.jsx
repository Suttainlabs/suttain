import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Share2, Library } from 'lucide-react';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import TeamsManager from '../components/collaboration/TeamsManager';
import SharedSimulations from '../components/collaboration/SharedSimulations';
import CustomLibraries from '../components/collaboration/CustomLibraries';

export default function Collaboration() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('teams');

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50">
        <AuthGate 
          featureName="Collaboration Hub"
          featureDescription="Share simulations, create custom libraries, and collaborate with your team."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            Collaboration Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Work Together
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Share simulations, build custom chemical libraries, and collaborate with your team on formulation projects.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
            <TabsTrigger 
              value="teams" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg py-3"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">My</span> Teams
            </TabsTrigger>
            <TabsTrigger 
              value="shared"
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-lg py-3"
            >
              <Share2 className="w-4 h-4" />
              Shared <span className="hidden sm:inline">Simulations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="libraries"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg py-3"
            >
              <Library className="w-4 h-4" />
              Libraries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamsManager />
          </TabsContent>

          <TabsContent value="shared">
            <SharedSimulations />
          </TabsContent>

          <TabsContent value="libraries">
            <CustomLibraries />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}