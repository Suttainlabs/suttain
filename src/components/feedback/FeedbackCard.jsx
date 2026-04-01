import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, UserCircle, Beaker, FileText, QrCode } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function FeedbackCard({ review }) {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-amber-400 fill-current" : "text-slate-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-slate-700">{rating}/5</span>
      </div>
    );
  };

  const getFeatureInfo = (feature) => {
    switch (feature) {
      case 'simulator':
        return {
          label: 'Chemical Simulator',
          icon: Beaker,
          color: 'bg-teal-100 text-teal-800 border-teal-200'
        };
      case 'generator':
        return {
          label: 'Formula Generator', 
          icon: FileText,
          color: 'bg-violet-100 text-violet-800 border-violet-200'
        };
      case 'scanner':
        return {
          label: 'Barcode Scanner',
          icon: QrCode,
          color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
        };
      default:
        return {
          label: 'General',
          icon: UserCircle,
          color: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };
  
  const getAnonymizedEmail = (email) => {
    if (!email || !email.includes('@')) return 'Anonymous User';
    const [localPart, domain] = email.split('@');
    return `${localPart.substring(0, 2)}***@${domain}`;
  }

  const featureInfo = getFeatureInfo(review.feature_used);

  return (
    <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        {/* Top row: feature badge + date */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={`${featureInfo.color} font-medium flex items-center gap-1 text-xs`}>
            <featureInfo.icon className="w-3 h-3" />
            {featureInfo.label}
          </Badge>
          <span className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(review.created_date))} ago
          </span>
        </div>

        {/* Stars */}
        {renderStars(review.rating)}

        {/* Feedback text */}
        {review.feedback && (
          <p className="mt-3 text-slate-700 text-sm leading-relaxed line-clamp-4">
            &ldquo;{review.feedback}&rdquo;
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="w-7 h-7 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-xs text-slate-500 font-medium">{getAnonymizedEmail(review.created_by)}</span>
        </div>
      </CardContent>
    </Card>
  );
}