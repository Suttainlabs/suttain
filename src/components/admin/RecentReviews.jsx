import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageSquare } from 'lucide-react';
// Assuming User entity can be used to fetch info

// Helper to get initials
const getInitials = (email) => {
  if (!email) return 'U';
  const parts = email.split('@')[0].split('.').map(p => p[0]).join('');
  return (parts || 'U').toUpperCase().substring(0, 2);
};

// Star rating component
const StarRating = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
      />
    ))}
  </div>
);

export default function RecentReviews({ reviews }) {
  return (
    <Card className="shadow-lg col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-500" />
          Recent Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews && reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map(review => (
              <li key={review.id} className="flex items-start gap-4">
                <Avatar className="w-10 h-10 border">
                  {/* Future enhancement: fetch user profile image */}
                  <AvatarFallback className="bg-slate-100 text-slate-500">{getInitials(review.created_by)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{review.created_by.split('@')[0]}</p>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-xs text-slate-500 capitalize">{review.feature_used} Review</p>
                  {review.feedback && <p className="text-sm text-slate-600 mt-1 italic">"{review.feedback}"</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No recent reviews submitted.</p>
        )}
      </CardContent>
    </Card>
  );
}