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
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Archive,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/hooks/useNotifications';

const typeIcons = {
  attendance: UserCheck,
  remark: MessageCircle,
  announcement: Megaphone,
  admin_message: Shield
};

const typeColors = {
  attendance: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  remark: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  announcement: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  admin_message: 'text-red-500 bg-red-100 dark:bg-red-900/30'
};

const typeLabels = {
  attendance: 'Attendance',
  remark: 'Remark',
  announcement: 'Announcement',
  admin_message: 'Admin Message'
};

export function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    const matchesRead = !showUnreadOnly || !notification.is_read;
    
    return matchesSearch && matchesType && matchesRead;
  });

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const IconComponent = typeIcons[notification.type];

    return (
      <div
        className={`p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all ${
          !notification.is_read 
            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
            : 'bg-white dark:bg-gray-800'
        }`}
      >
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${typeColors[notification.type]}`}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {notification.title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 mt-1">
                  {typeLabels[notification.type]}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {!notification.is_read ? (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="p-1 text-gray-400">
                    <Eye className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {notification.content}
            </p>

            {/* Metadata */}
            {notification.metadata && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <pre className="whitespace-pre-wrap font-mono text-xs">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              <span>
                {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-gray-900 dark:text-gray-100 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="ml-3 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="attendance">Attendance</option>
            <option value="remark">Remarks</option>
            <option value="announcement">Announcements</option>
            <option value="admin_message">Admin Messages</option>
          </select>

          {/* Unread Filter */}
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              showUnreadOnly
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {showUnreadOnly ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || filterType !== 'all' || showUnreadOnly 
              ? 'No matching notifications' 
              : 'No notifications yet'
            }
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || filterType !== 'all' || showUnreadOnly 
              ? 'Try adjusting your filters or search terms'
              : "You'll see new notifications here when they arrive"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}