import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProfileSetupModal from '../safety/ProfileSetupModal';
import { toast } from 'sonner';

export default function SafetyProfileManager() {
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  const { data: profiles = [], refetch } = useQuery({
    queryKey: ['user-safety-profiles'],
    queryFn: () => base44.entities.SafetyProfile.list(),
    initialData: []
  });

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowModal(true);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setShowModal(true);
  };

  const handleDeleteProfile = async (profileId) => {
    if (!confirm('Are you sure you want to delete this safety profile?')) return;
    
    try {
      await base44.entities.SafetyProfile.delete(profileId);
      toast.success('Safety profile deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete profile');
      console.error(error);
    }
  };

  const handleSaveProfile = () => {
    setShowModal(false);
    setEditingProfile(null);
    refetch();
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Safety Profiles</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Manage your health conditions and allergies</p>
              </div>
            </div>
            <Button onClick={handleCreateProfile} size="sm" className="bg-rose-600 hover:bg-rose-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 text-sm mb-4">No safety profiles yet</p>
              <Button onClick={handleCreateProfile} variant="outline" size="sm">
                Create Your First Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">{profile.profile_name}</h4>
                        {profile.is_default && (
                          <Badge className="bg-rose-100 text-rose-700 text-xs">Default</Badge>
                        )}
                      </div>
                      
                      {/* Health Conditions */}
                      {profile.health_conditions && Object.values(profile.health_conditions).some(v => v) && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-500 mb-1">Conditions:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(profile.health_conditions)
                              .filter(([_, value]) => value)
                              .map(([key]) => (
                                <Badge key={key} variant="outline" className="text-xs bg-white">
                                  {key.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Allergies */}
                      {profile.allergies && profile.allergies.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Allergies:</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.allergies.slice(0, 5).map((allergy) => (
                              <Badge key={allergy} variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-800">
                                {allergy}
                              </Badge>
                            ))}
                            {profile.allergies.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.allergies.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showModal && (
          <ProfileSetupModal
            profile={editingProfile}
            onClose={() => {
              setShowModal(false);
              setEditingProfile(null);
            }}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>
    </>
  );
}