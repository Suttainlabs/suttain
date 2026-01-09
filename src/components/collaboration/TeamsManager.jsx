import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Copy, UserPlus, Crown, Shield, Eye, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthContext from '../auth/AuthContext';
import { toast } from 'sonner';

export default function TeamsManager() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams', user?.email],
    queryFn: async () => {
      const allTeams = await base44.entities.Team.list();
      return allTeams.filter(team => 
        team.members?.some(m => m.email === user?.email) || team.created_by === user?.email
      );
    },
    enabled: !!user
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return base44.entities.Team.create({
        ...teamData,
        invite_code: inviteCode,
        members: [{
          email: user.email,
          role: 'owner',
          joined_date: new Date().toISOString()
        }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setShowCreateDialog(false);
      setNewTeam({ name: '', description: '' });
      toast.success('Team created successfully!');
    }
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (code) => {
      const allTeams = await base44.entities.Team.list();
      const team = allTeams.find(t => t.invite_code === code.toUpperCase());
      if (!team) throw new Error('Invalid invite code');
      if (team.members?.some(m => m.email === user.email)) throw new Error('Already a member');
      
      const updatedMembers = [...(team.members || []), {
        email: user.email,
        role: 'member',
        joined_date: new Date().toISOString()
      }];
      
      return base44.entities.Team.update(team.id, { members: updatedMembers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setShowJoinDialog(false);
      setJoinCode('');
      toast.success('Joined team successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-amber-500" />;
      case 'admin': return <Shield className="w-3 h-3 text-blue-500" />;
      case 'viewer': return <Eye className="w-3 h-3 text-slate-400" />;
      default: return null;
    }
  };

  const getUserRole = (team) => {
    return team.members?.find(m => m.email === user?.email)?.role || 
           (team.created_by === user?.email ? 'owner' : 'member');
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" /> Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Team name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
              <Textarea
                placeholder="Team description (optional)"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              />
              <Button 
                onClick={() => createTeamMutation.mutate(newTeam)}
                disabled={!newTeam.name || createTeamMutation.isPending}
                className="w-full"
              >
                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <UserPlus className="w-4 h-4" /> Join Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button 
                onClick={() => joinTeamMutation.mutate(joinCode)}
                disabled={joinCode.length !== 6 || joinTeamMutation.isPending}
                className="w-full"
              >
                {joinTeamMutation.isPending ? 'Joining...' : 'Join Team'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card className="bg-white/90">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No teams yet</h3>
            <p className="text-slate-500 text-sm mb-4">Create a team or join one with an invite code</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/90 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {getRoleIcon(getUserRole(team))}
                          <span className="text-xs text-slate-500 capitalize">{getUserRole(team)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{team.members?.length || 1} members</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-sm text-slate-600 mb-4">{team.description}</p>
                  )}
                  
                  {/* Members Preview */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {team.members?.slice(0, 5).map((member, i) => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-xs">
                            {member.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    {team.members?.length > 5 && (
                      <span className="text-xs text-slate-500">+{team.members.length - 5} more</span>
                    )}
                  </div>

                  {/* Invite Code */}
                  {(getUserRole(team) === 'owner' || getUserRole(team) === 'admin') && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-500">Invite code:</span>
                      <code className="font-mono text-sm font-semibold text-indigo-600">{team.invite_code}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 ml-auto"
                        onClick={() => copyInviteCode(team.invite_code)}
                      >
                        {copiedCode === team.invite_code ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}