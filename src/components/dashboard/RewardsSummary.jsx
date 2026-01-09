import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Target, ArrowRight, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function RewardsSummary({ user }) {
  const points = user?.reward_points || 0;
  const nextMilestone = Math.ceil((points + 1) / 100) * 100;
  const progress = (points % 100);

  const getLevel = (pts) => {
    if (pts >= 500) return { name: 'Expert', color: 'from-purple-500 to-indigo-600', icon: '🏆' };
    if (pts >= 250) return { name: 'Advanced', color: 'from-blue-500 to-cyan-500', icon: '⭐' };
    if (pts >= 100) return { name: 'Intermediate', color: 'from-teal-500 to-green-500', icon: '🌟' };
    return { name: 'Beginner', color: 'from-amber-400 to-orange-500', icon: '✨' };
  };

  const level = getLevel(points);

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 bg-gradient-to-br ${level.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800/70">Your Points</p>
              <p className="text-3xl font-bold text-amber-900">{points}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl">{level.icon}</span>
            <p className="text-xs font-semibold text-amber-700 mt-1">{level.name}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-amber-700 font-medium">Progress to {nextMilestone} pts</span>
            <span className="text-amber-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-amber-200" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/60 rounded-lg p-2.5 text-center">
            <Trophy className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-amber-800">Earn More</p>
            <p className="text-[10px] text-amber-600">Complete activities</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2.5 text-center">
            <Target className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-amber-800">Next Goal</p>
            <p className="text-[10px] text-amber-600">{nextMilestone - points} pts away</p>
          </div>
        </div>

        <Link to={createPageUrl("ReviewRewards")}>
          <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            View Rewards
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}