import { NotificationsCenter } from "@/components/features/notifications/notifications-center";
import { notifications } from "@/data/notifications";

export default function CandidateNotificationsPage() {
  return (
    <NotificationsCenter
      source={notifications}
      heading="Notifications"
      description="Updates about your applications, new job matches, and account activity."
    />
  );
}