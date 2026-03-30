'use client';

import { useState } from 'react';
import { Send, MessageCircle, Megaphone, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NotificationComposerProps {
  onClose?: () => void;
  defaultRecipient?: string;
  defaultType?: 'attendance' | 'remark' | 'announcement' | 'admin_message';
}

const typeOptions = [
  { value: 'announcement'  as const, label: 'Announcement',     icon: Megaphone,       color: 'text-orange-500' },
  { value: 'remark'        as const, label: 'Remark',            icon: MessageCircle,   color: 'text-green-500'  },
  { value: 'attendance'    as const, label: 'Attendance Update', icon: Users,           color: 'text-blue-500'   },
  { value: 'admin_message' as const, label: 'Admin Message',     icon: Shield,          color: 'text-red-500'    },
];

const textareaBase =
  'w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm ' +
  'placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring';

export function NotificationComposer({
  onClose,
  defaultRecipient,
  defaultType = 'announcement',
}: NotificationComposerProps) {
  const { profile } = useAuth();
  const { sendNotification } = useNotifications();

  const [formData, setFormData] = useState({
    type:       defaultType,
    title:      '',
    content:    '',
    recipients: defaultRecipient || '',
    metadata:   '{}',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const recipientList = formData.recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      if (recipientList.length === 0) throw new Error('Please specify at least one recipient');

      let metadata = null;
      if (formData.metadata.trim()) {
        try { metadata = JSON.parse(formData.metadata); }
        catch { throw new Error('Invalid metadata JSON'); }
      }

      const ok = await sendNotification(
        recipientList,
        formData.type,
        formData.title,
        formData.content,
        metadata,
      );

      if (ok) {
        setSuccess(true);
        setFormData({ type: defaultType, title: '', content: '', recipients: defaultRecipient || '', metadata: '{}' });
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile || !['admin', 'faculty'].includes(profile.role)) {
    return (
      <Card className="p-6 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">You don&apos;t have permission to send notifications.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {onClose && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Send Notification</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <span aria-hidden>✕</span>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Selection */}
        <div>
          <p className="text-sm font-medium text-foreground/80 mb-2">Notification Type</p>
          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                  formData.type === value
                    ? 'bg-primary/10 border-primary/40'
                    : 'border-border hover:bg-muted',
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4', color)} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-1.5">
          <label htmlFor="recipients" className="text-sm font-medium text-foreground/80">
            Recipients <span className="text-muted-foreground font-normal">(comma-separated emails or user IDs)</span>
          </label>
          <Input
            id="recipients"
            type="text"
            value={formData.recipients}
            onChange={e => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
            placeholder="user1@example.com, user2@example.com"
            required
          />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="notif-title" className="text-sm font-medium text-foreground/80">Title</label>
          <Input
            id="notif-title"
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter notification title"
            required
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label htmlFor="notif-content" className="text-sm font-medium text-foreground/80">Message</label>
          <textarea
            id="notif-content"
            rows={4}
            value={formData.content}
            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter your message here..."
            className={textareaBase}
            required
          />
        </div>

        {/* Metadata */}
        <div className="space-y-1.5">
          <label htmlFor="notif-metadata" className="text-sm font-medium text-foreground/80">
            Metadata <span className="text-muted-foreground font-normal">(optional JSON)</span>
          </label>
          <textarea
            id="notif-metadata"
            rows={2}
            value={formData.metadata}
            onChange={e => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
            placeholder='{"key": "value"}'
            className={cn(textareaBase, 'font-mono text-xs')}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Notification sent successfully!</p>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full gap-2">
          {isLoading ? (
            <><div className="loading-spinner w-4 h-4" />Sending&hellip;</>
          ) : (
            <><Send className="w-4 h-4" />Send Notification</>
          )}
        </Button>
      </form>
    </Card>
  );
}
