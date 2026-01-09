import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Eye, MessageSquare, Globe, Users, Lock, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthContext from '../auth/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import CommentsSection from './CommentsSection';

export default function SharedSimulations() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareSettings, setShareSettings] = useState({ type: 'private_link', title: '' });
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch user's simulations
  const { data: simulations = [] } = useQuery({
    queryKey: ['simulations', user?.email],
    queryFn: () => base44.entities.Simulation.filter({ created_by: user?.email }),
    enabled: !!user
  });

  // Fetch shared simulations
  const { data: sharedSimulations = [], isLoading } = useQuery({
    queryKey: ['shared-simulations', user?.email],
    queryFn: async () => {
      const all = await base44.entities.SharedSimulation.list();
      return all.filter(s => 
        s.created_by === user?.email || 
        s.shared_with?.includes(user?.email) ||
        s.share_type === 'public'
      );
    },
    enabled: !!user
  });

  const shareMutation = useMutation({
    mutationFn: async ({ simulation, settings }) => {
      const shareLink = Math.random().toString(36).substring(2, 10);
      return base44.entities.SharedSimulation.create({
        simulation_id: simulation.id,
        title: settings.title || `Simulation: ${simulation.chemicals?.join(', ')}`,
        share_type: settings.type,
        share_link: shareLink,
        simulation_data: simulation,
        allow_comments: true
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['shared-simulations']);
      setShowShareDialog(false);
      toast.success('Simulation shared successfully!');
    }
  });

  const copyShareLink = (link) => {
    const fullLink = `${window.location.origin}/shared/${link}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success('Link copied!');
  };

  const getShareIcon = (type) => {
    switch (type) {
      case 'public': return <Globe className="w-4 h-4 text-green-600" />;
      case 'team': return <Users className="w-4 h-4 text-blue-600" />;
      default: return <Lock className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Share New Simulation */}
      <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Share Your Work</h3>
              <p className="text-teal-100 text-sm">Select a simulation to share with your team or publicly</p>
            </div>
            <Select onValueChange={(id) => {
              const sim = simulations.find(s => s.id === id);
              if (sim) {
                setSelectedSimulation(sim);
                setShareSettings({ ...shareSettings, title: `Simulation: ${sim.chemicals?.join(', ')}` });
                setShowShareDialog(true);
              }
            }}>
              <SelectTrigger className="w-[200px] bg-white text-slate-900">
                <SelectValue placeholder="Select simulation" />
              </SelectTrigger>
              <SelectContent>
                {simulations.map(sim => (
                  <SelectItem key={sim.id} value={sim.id}>
                    {sim.chemicals?.slice(0, 2).join(' + ') || 'Unnamed'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Simulation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Title for shared simulation"
              value={shareSettings.title}
              onChange={(e) => setShareSettings({ ...shareSettings, title: e.target.value })}
            />
            <Select 
              value={shareSettings.type} 
              onValueChange={(v) => setShareSettings({ ...shareSettings, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private_link">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Private Link
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Team Only
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Public
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => shareMutation.mutate({ simulation: selectedSimulation, settings: shareSettings })}
              disabled={shareMutation.isPending}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {shareMutation.isPending ? 'Sharing...' : 'Share Simulation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shared Simulations List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Shared with You</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sharedSimulations.length === 0 ? (
          <Card className="bg-white/90">
            <CardContent className="p-8 text-center">
              <Share2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No shared simulations yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sharedSimulations.map((shared) => (
              <SharedSimulationCard 
                key={shared.id} 
                shared={shared} 
                onCopyLink={copyShareLink}
                copiedLink={copiedLink}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SharedSimulationCard({ shared, onCopyLink, copiedLink }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-white/90 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {shared.share_type === 'public' && <Globe className="w-4 h-4 text-green-600" />}
                {shared.share_type === 'team' && <Users className="w-4 h-4 text-blue-600" />}
                {shared.share_type === 'private_link' && <Lock className="w-4 h-4 text-slate-500" />}
                <h4 className="font-semibold text-slate-900">{shared.title}</h4>
              </div>
              <p className="text-sm text-slate-500 mb-2">
                {shared.simulation_data?.chemicals?.join(', ')}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {shared.view_count || 0} views
                </span>
                <span>{formatDistanceToNow(new Date(shared.created_date), { addSuffix: true })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowComments(!showComments)}
                className="gap-1"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopyLink(shared.share_link)}
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {showComments && (
            <div className="mt-4 pt-4 border-t">
              <CommentsSection targetType="simulation" targetId={shared.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}