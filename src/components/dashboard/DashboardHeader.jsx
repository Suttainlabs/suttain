import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, User as UserIcon, Edit2, Settings as SettingsIcon, Crown, Check, Lock, Gem } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AuthContext from '../auth/AuthContext';
import EditProfileModal from '../profile/EditProfileModal';

export default function DashboardHeader({ greeting }) {
  const { user } = useContext(AuthContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  
  if (!user) return null;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-md border-4 border-white">
              {user.profile_image_url ? (
                <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                  <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              )}
            </div>
            <Button 
              size="icon" 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md hover:bg-gray-50 border border-gray-200"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-700" />
            </Button>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2 flex-wrap">
              {greeting}, {user.display_name || user.full_name?.split(' ')[0] || 'User'}!
              <Popover>
                <PopoverTrigger asChild>
                  {user.role === 'admin' ? (
                    <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <Crown className="w-3 h-3 mr-1" /> Premium
                    </button>
                  ) : (
                    <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                      <Gem className="w-3 h-3 mr-1" /> Free
                    </button>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  {user.role === 'admin' ? (
                    <>
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-white" />
                          <span className="font-bold text-white">Premium Access</span>
                        </div>
                        <p className="text-white/90 text-xs mt-1">Full access to all features</p>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Your Premium Features:</p>
                        {['AI Compliance Co-Pilot', 'Personalized Safety Alerts', 'Sustainability Scoring', 'Priority Support'].map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <Gem className="w-5 h-5 text-white" />
                          <span className="font-bold text-white">Free Plan</span>
                        </div>
                        <p className="text-white/90 text-xs mt-1">Upgrade to unlock more</p>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Unlock Premium Features:</p>
                        {['AI Compliance Co-Pilot', 'Personalized Safety Alerts', 'Sustainability Scoring', 'Priority Support'].map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                            <Lock className="w-4 h-4" />
                            {feature}
                          </div>
                        ))}
                        <Link 
                          to={createPageUrl('Pricing')}
                          className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-opacity"
                        >
                          <Crown className="w-4 h-4 mr-2" /> Upgrade to Premium
                        </Link>
                      </div>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-0.5 font-medium">
              {user.role === 'admin' ? 'Administrator' : 'User Dashboard'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={createPageUrl("ReviewRewards")}>
            <Card className="bg-gradient-to-br from-yellow-400 to-amber-500 border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-900/80 uppercase tracking-wide">Points</p>
                  <p className="text-2xl font-bold text-white">
                    {user.reward_points || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl('Settings'))}
            className="w-11 h-11 rounded-full hover:bg-gray-100 border-gray-200"
          >
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}