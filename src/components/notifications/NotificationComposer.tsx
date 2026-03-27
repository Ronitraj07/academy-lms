'use client';

import { useState } from 'react';
import { Send, Users, MessageCircle, Megaphone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationComposerProps {
  onClose?: () => void;
  defaultRecipient?: string;
  defaultType?: 'attendance' | 'remark' | 'announcement' | 'admin_message';
}

const typeOptions: Array<{
  value: 'attendance' | 'remark' | 'announcement' | 'admin_message';
  label: string;
  icon: any;
  color: string;
}> = [
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-orange-500' },
  { value: 'remark', label: 'Remark', icon: MessageCircle, color: 'text-green-500' },
  { value: 'attendance', label: 'Attendance Update', icon: Users, color: 'text-blue-500' },
  { value: 'admin_message', label: 'Admin Message', icon: Shield, color: 'text-red-500' }
] as const;

export function NotificationComposer({ 
  onClose, 
  defaultRecipient, 
  defaultType = 'announcement' 
}: NotificationComposerProps) {
  const { profile } = useAuth();
  const { sendNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    type: defaultType,
    title: '',
    content: '',
    recipients: defaultRecipient || '',
    metadata: '{}'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Parse recipients (can be comma-separated emails or user IDs)
      const recipientList = formData.recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      if (recipientList.length === 0) {
        throw new Error('Please specify at least one recipient');
      }

      // Parse metadata
      let metadata = null;
      if (formData.metadata.trim()) {
        try {
          metadata = JSON.parse(formData.metadata);
        } catch {
          throw new Error('Invalid metadata JSON');
        }
      }

      // Send notification
      const success = await sendNotification(
        recipientList,
        formData.type as any,
        formData.title,
        formData.content,
        metadata
      );

      if (success) {
        // Reset form
        setFormData({
          type: defaultType,
          title: '',
          content: '',
          recipients: defaultRecipient || '',
          metadata: '{}'
        });
        
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  // Only admins and faculty can send notifications
  if (!profile || !profile.role || !['admin', 'faculty'].includes(profile.role)) {
    return (
      <Card className="p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to send notifications.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Send Notification
        </h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notification Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: option.value }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    formData.type === option.value
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`w-4 h-4 ${option.color}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipients */}
        <div>
          <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recipients (comma-separated emails or user IDs)
          </label>
          <Input
            id="recipients"
            type="text"
            value={formData.recipients}
            onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
            placeholder="user1@example.com, user2@example.com"
            required
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter notification title"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          <textarea
            id="content"
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter your message here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Metadata (Optional) */}
        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Metadata (optional JSON)
          </label>
          <textarea
            id="metadata"
            rows={2}
            value={formData.metadata}
            onChange={(e) => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
            placeholder='{"key": "value"}'
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}