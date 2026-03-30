'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Bell,
  MessageCircle,
  UserCheck,
  Megaphone,
  Shield,
  Search,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/hooks/useNotifications';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeIcons = {
  attendance:    UserCheck,
  remark:        MessageCircle,
  announcement:  Megaphone,
  admin_message: Shield,
};

const typeColors = {
  attendance:    'text-blue-500   bg-blue-100   dark:bg-blue-900/30',
  remark:        'text-green-500  bg-green-100  dark:bg-green-900/30',
  announcement:  'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  admin_message: 'text-red-500    bg-red-100    dark:bg-red-900/30',
};

const typeLabels = {
  attendance:    'Attendance',
  remark:        'Remark',
  announcement:  'Announcement',
  admin_message: 'Admin Message',
};

function NotificationCard({ notification, onMarkAsRead }: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const IconComponent = typeIcons[notification.type];

  return (
    <div
      className={cn(
        'p-6 border rounded-lg hover:shadow-md transition-all',
        notification.is_read
          ? 'bg-card border-border'
          : 'bg-primary/5 border-primary/30',
      )}
    >
      <div className="flex items-start space-x-4">
        <div className={cn('flex-shrink-0 p-2 rounded-lg', typeColors[notification.type])}>
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {notification.title}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground mt-1">
                {typeLabels[notification.type]}
              </span>
            </div>

            {!notification.is_read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="p-1 text-primary hover:text-primary/80 transition-colors"
                title="Mark as read"
                aria-label={`Mark "${notification.title}" as read`}
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3">{notification.content}</p>

          {notification.metadata && (
            <div className="mb-3 p-3 bg-muted rounded text-sm">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {JSON.stringify(notification.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
            <span>{format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterType,     setFilterType]     = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType   = filterType === 'all' || n.type === filterType;
    const matchesRead   = !showUnreadOnly || !n.is_read;
    return matchesSearch && matchesType && matchesRead;
  });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search notifications"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            aria-label="Filter by type"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Types</option>
            <option value="attendance">Attendance</option>
            <option value="remark">Remarks</option>
            <option value="announcement">Announcements</option>
            <option value="admin_message">Admin Messages</option>
          </select>

          {/* Unread Toggle */}
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            aria-pressed={showUnreadOnly}
            className={cn(
              'flex items-center gap-2 h-9 px-4 rounded-md border text-sm font-medium transition-colors',
              showUnreadOnly
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-foreground hover:bg-muted',
            )}
          >
            {showUnreadOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
        </div>

        {/* Mark all read */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <>
              <Badge variant="destructive">{unreadCount} unread</Badge>
              <Button size="sm" variant="default" onClick={markAllAsRead} className="gap-1.5">
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="loading-spinner w-8 h-8" />
          <p className="text-sm text-muted-foreground">Loading notifications&hellip;</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery || filterType !== 'all' || showUnreadOnly
              ? 'No matching notifications'
              : 'No notifications yet'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || filterType !== 'all' || showUnreadOnly
              ? 'Try adjusting your filters or search terms'
              : "You'll see new notifications here when they arrive"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(n => (
            <NotificationCard key={n.id} notification={n} onMarkAsRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}
