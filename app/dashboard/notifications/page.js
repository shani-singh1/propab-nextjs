import { NotificationList } from "@/components/notifications/notification-list"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"
import { NotificationAnalytics } from "@/components/notifications/notification-analytics"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <NotificationList />
        <div className="space-y-6">
          <NotificationPreferences />
          <NotificationAnalytics />
        </div>
      </div>
    </div>
  )
} 