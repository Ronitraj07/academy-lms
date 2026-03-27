'use client';

import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  MessageCircle, 
  UserCheck, 
  Megaphone, 
  Shield,
  MoreHorizontal,
  Check,
  CheckCheck
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationDropdownProps {
  onClose: () => void;
}

const typeIcons = {
  attendance: UserCheck,
  remark: MessageCircle,
  announcement: Megaphone,
  admin_message: Shield
};

const typeColors = {
  attendance: 'text-blue-500',
  remark: 'text-green-500',
  announcement: 'text-orange-500',
  admin_message: 'text-red-500'
};

function NotificationItem({ notification, onMarkAsRead }: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
}) {
  const IconComponent = typeIcons[notification.type];

  return (
    <div
      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${typeColors[notification.type]}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {notification.title}
            </p>
            {!notification.is_read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="ml-2 text-blue-500 hover:text-blue-600 transition-colors"
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {notification.content}
          </p>
          
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <div className="w-80 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1">You'll see new notifications here</p>
          </div>
        ) : (
          <>
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
            
            {notifications.length > 10 && (
              <div className="p-3 text-center border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={onClose}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 inline mr-1" />
            View notification center
          </button>
        </div>
      )}
    </div>
  );
}