/**
 * User status types
 */
export type UserStatus = 'free' | 'active_subscriber' | 'expired_subscriber' | 'admin';

/**
 * Content types
 */
export type ContentType = 'historia' | 'personagem' | 'grande_obra' | 'video' | 'trecho_biblico';

/**
 * Content status types
 */
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'hidden';

/**
 * Subscription plan types
 */
export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

/**
 * Subscription status types
 */
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';

/**
 * Report target types
 */
export type ReportTargetType = 'content' | 'comment' | 'user';

/**
 * Report status types
 */
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

/**
 * Notification types
 */
export type NotificationType = 'push' | 'email' | 'campaign';
