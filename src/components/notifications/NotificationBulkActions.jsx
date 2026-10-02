import React from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationBulkActions({ unreadCount, notificationCount, reading, clearing, onReadAll, onClearAll }) {
  const busy = reading || clearing;
  return (
    <div className="flex shrink-0 flex-wrap gap-3 border-b border-border bg-background px-4 py-3">
      <Button type="button" variant="outline" onClick={onReadAll} disabled={busy || unreadCount === 0} className="flex-1">
        <CheckCheck className="mr-2 h-4 w-4" />{reading ? 'Reading...' : 'Read all'}
      </Button>
      <Button type="button" variant="outline" onClick={onClearAll} disabled={busy || notificationCount === 0} className="flex-1 text-destructive hover:text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />{clearing ? 'Clearing...' : 'Clear all'}
      </Button>
    </div>
  );
}