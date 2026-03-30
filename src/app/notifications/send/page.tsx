import { NotificationComposer } from '@/components/notifications/NotificationComposer';

export default function SendNotificationPage() {
  return (
    <div className="max-w-2xl space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Send Notification</h1>
        <p className="text-muted-foreground">
          Send announcements to students or faculty members
        </p>
      </div>
      <NotificationComposer />
    </div>
  );
}
