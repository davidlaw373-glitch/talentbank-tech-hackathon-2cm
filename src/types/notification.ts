export type NotificationType =
  | "application"
  | "match"
  | "verification"
  | "profile"
  | "system"
  | "candidate"
  | "interview"
  | "offer"
  | "credential"
  | "graduate"
  | "dispute"
  | "report";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};