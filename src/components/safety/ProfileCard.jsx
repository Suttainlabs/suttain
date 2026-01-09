import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Edit2, Trash2, Star, Shield, AlertTriangle } from 'lucide-react';

export default function ProfileCard({ profile, onEdit, onRefetch }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    setIsDeleting(true);
    try {
      await base44.entities.SafetyProfile.delete(profile.id);
      onRefetch();
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Failed to delete profile');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleDefault = async () => {
    try {
      await base44.entities.SafetyProfile.update(profile.id, {
        ...profile,
        is_default: !profile.is_default
      });
      onRefetch();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const activeConditions = Object.entries(profile.health_conditions || {})
    .filter(([_, value]) => value)
    .map(([key]) => key.replace(/_/g, ' '));

  const totalItems = activeConditions.length + (profile.allergies?.length || 0) + (profile.custom_sensitivities?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className={`border-0 shadow-lg transition-all ${
        profile.is_default ? 'ring-2 ring-rose-400' : ''
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-900">{profile.profile_name}</h3>
                {profile.is_default && (
                  <Badge className="bg-rose-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>{totalItems} condition{totalItems !== 1 ? 's' : ''}</span>
                </div>
                {profile.allergies && profile.allergies.length > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{profile.allergies.length} allergen{profile.allergies.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(profile)}
                className="hover:bg-slate-100"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Conditions Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activeConditions.map((condition, index) => (
              <Badge key={index} variant="outline" className="capitalize">
                {condition}
              </Badge>
            ))}
          </div>

          {/* Allergies */}
          {profile.allergies && profile.allergies.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">Allergies:</p>
              <div className="flex flex-wrap gap-1">
                {profile.allergies.map((allergy, index) => (
                  <Badge key={index} className="bg-amber-100 text-amber-800 text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <Button
              size="sm"
              variant={profile.is_default ? "outline" : "default"}
              onClick={handleToggleDefault}
              className={profile.is_default ? '' : 'bg-rose-600 hover:bg-rose-700 text-white'}
            >
              {profile.is_default ? (
                <>Remove Default</>
              ) : (
                <>
                  <Star className="w-3 h-3 mr-1" />
                  Set as Default
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}