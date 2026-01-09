import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, AlertTriangle, Info, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getNotificationConfig = (type, severity) => {
  const configs = {
    safety: { icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
    compliance: { icon: ShieldCheck, color: 'bg-amber-100 text-amber-600' },
    feature: { icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
    system: { icon: Info, color: 'bg-blue-100 text-blue-600' },
  };
  return configs[type] || configs.system;
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const config = getNotificationConfig(notification.type, notification.severity);
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
      notification.is_read ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${notification.is_read ? 'text-slate-500' : 'text-slate-800'}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{notification.message}</p>
        <p className="text-xs text-slate-400 mt-1">
          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default function NotificationsSummary({ notifications, isLoading, onOpenNotifications }) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-slate-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={onOpenNotifications}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {notifications.slice(0, 5).map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-slate-400">No new notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}