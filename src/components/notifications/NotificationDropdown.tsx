'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  MessageCircle,
  UserCheck,
  Megaphone,
  Shield,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  onClose: () => void;
}

const typeIcons = {
  attendance:    UserCheck,
  remark:        MessageCircle,
  announcement:  Megaphone,
  admin_message: Shield,
};

const typeColors = {
  attendance:    'text-blue-500',
  remark:        'text-green-500',
  announcement:  'text-orange-500',
  admin_message: 'text-red-500',
};

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const IconComponent = typeIcons[notification.type];

  return (
    <div
      className={cn(
        'p-4 border-b border-border hover:bg-muted transition-colors',
        !notification.is_read && 'bg-primary/5',
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('shrink-0 mt-0.5', typeColors[notification.type])}>
          <IconComponent className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {notification.title}
            </p>
            {!notification.is_read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                aria-label={`Mark "${notification.title}" as read`}
                className="shrink-0 text-primary hover:text-primary/80 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.content}
          </p>

          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="w-80 max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              aria-label={`Mark all ${unreadCount} notifications as read`}
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto scrollbar-modern">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="loading-spinner w-5 h-5" />
            <p className="text-xs text-muted-foreground">Loading&hellip;</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-0.5">You&apos;ll see new notifications here</p>
          </div>
        ) : (
          notifications.slice(0, 10).map(n => (
            <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/50 rounded-b-lg">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors py-1"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
