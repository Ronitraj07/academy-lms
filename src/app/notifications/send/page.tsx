import { NotificationComposer } from '@/components/notifications/NotificationComposer';

export default function SendNotificationPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Send Notification
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send notifications to students or faculty members
        </p>
      </div>
      
      <NotificationComposer />
    </div>
  );
}