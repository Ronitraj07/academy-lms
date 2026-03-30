import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function NotificationsPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Notifications</h1>
        <p className="text-muted-foreground">Your alerts, announcements, and messages</p>
      </div>
      <NotificationCenter />
    </div>
  );
}
