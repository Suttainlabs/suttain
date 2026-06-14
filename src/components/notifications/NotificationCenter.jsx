import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, Shield, Sparkles, ExternalLink, Clock, UserPlus, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, addHours, addDays, isBefore } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const NotificationIcon = ({ type, severity }) => {
  if (severity === 'critical') return <AlertTriangle className="w-5 h-5 text-red-600" />;
  
  switch (type) {
    case 'safety': return <Shield className="w-5 h-5 text-rose-600" />;
    case 'compliance': return <Shield className="w-5 h-5 text-blue-600" />;
    case 'regulatory': return <FlaskConical className="w-5 h-5 text-orange-600" />;
    case 'subscription': return <Sparkles className="w-5 h-5 text-purple-600" />;
    case 'feature': return <Sparkles className="w-5 h-5 text-teal-600" />;
    case 'user_signup': return <UserPlus className="w-5 h-5 text-green-600" />;
    default: return <Info className="w-5 h-5 text-slate-600" />;
  }
};

const NotificationItem = ({ notification, onMarkRead, onSnooze, onClose }) => {
  const navigate = useNavigate();
  
  const handleClick = async () => {
    if (!notification.is_read) {
      await onMarkRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const getSeverityStyles = () => {
    switch (notification.severity) {
      case 'critical': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning': return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      default: return 'bg-white border-slate-200 hover:bg-slate-50';
    }
  };

  const handleSnooze = (e, duration) => {
    e.stopPropagation();
    onSnooze(notification.id, duration);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-4 border rounded-lg transition-colors cursor-pointer ${getSeverityStyles()} ${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''}`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <NotificationIcon type={notification.type} severity={notification.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-slate-900 leading-tight">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1">
              {notification.is_snoozed && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  <Clock className="w-3 h-3 mr-1" /> Snoozed
                </Badge>
              )}
              {!notification.is_read && !notification.is_snoozed && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}</span>
              {notification.action_url && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-blue-600">
                    View details <ExternalLink className="w-3 h-3" />
                  </span>
                </>
              )}
            </div>
            {!notification.is_snoozed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700">
                    <Clock className="w-3 h-3 mr-1" /> Snooze
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleSnooze(e, '1h')}>
                    1 hour
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleSnooze(e, '4h')}>
                    4 hours
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleSnooze(e, '1d')}>
                    1 day
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleSnooze(e, '1w')}>
                    1 week
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function NotificationCenter({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch, isFetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const allNotifications = await base44.entities.Notification.list('-created_date', 50);
      // Filter out snoozed notifications that haven't expired
      return allNotifications.filter(n => {
        if (n.is_snoozed && n.snoozed_until) {
          return isBefore(new Date(n.snoozed_until), new Date());
        }
        return !n.is_snoozed;
      });
    },
    enabled: isOpen,
    initialData: []
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    }
  });

  const snoozeMutation = useMutation({
    mutationFn: async ({ id, duration }) => {
      let snoozedUntil;
      switch (duration) {
        case '1h': snoozedUntil = addHours(new Date(), 1); break;
        case '4h': snoozedUntil = addHours(new Date(), 4); break;
        case '1d': snoozedUntil = addDays(new Date(), 1); break;
        case '1w': snoozedUntil = addDays(new Date(), 7); break;
        default: snoozedUntil = addHours(new Date(), 1);
      }
      return base44.entities.Notification.update(id, { 
        is_snoozed: true, 
        snoozed_until: snoozedUntil.toISOString() 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      toast.success('Notification snoozed');
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => base44.entities.Notification.update(id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-slate-500">{unreadCount} unread</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-8 w-8 p-0" title="Refresh">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Pull to refresh indicator */}
            {isFetching && (
              <div className="flex justify-center py-2 bg-slate-50 border-b">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Notifications List */}
            <ScrollArea className="flex-1 p-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-1">No notifications yet</p>
                  <p className="text-sm text-slate-500">We'll notify you about important updates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markReadMutation.mutate}
                        onSnooze={(id, duration) => snoozeMutation.mutate({ id, duration })}
                        onClose={onClose}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}