export enum NotificationType {
  WELCOME = 'welcome',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  RENEWAL_CONFIRMED = 'renewal_confirmed',
  REPORT_RECEIVED = 'report_received',
  REPORT_RESOLVED = 'report_resolved',
  ACCOUNT_CLOSED = 'account_closed',
  CAMPAIGN = 'campaign',
}

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  BOTH = 'both',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

export interface NotificationPayload {
  type: NotificationType;
  channel: NotificationChannel;
  userId: number;
  email?: string;
  fcmToken?: string;
  subject?: string;
  variables?: Record<string, string | number>;
}

export interface EmailTemplate {
  id: number;
  type: NotificationType;
  subject: string;
  htmlBody: string;
  textBody: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushTemplate {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationLog {
  id: number;
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  payload: Record<string, unknown>;
  error?: string;
  attempts: number;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueJobData {
  notificationId: number;
  payload: NotificationPayload;
  attempt: number;
}
