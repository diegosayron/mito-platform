import { query } from '../database';
import { NotificationPayload, NotificationChannel, NotificationStatus, NotificationLog } from '../types';
import { EmailService } from './email.service';
import { FirebaseService } from './firebase.service';
import { TemplateService } from './template.service';

export class NotificationService {
  constructor(
    private emailService: EmailService,
    private firebaseService: FirebaseService,
    private templateService: TemplateService
  ) {}

  async createNotification(payload: NotificationPayload): Promise<number> {
    const rows = await query<{ id: number }>(
      `INSERT INTO notification_logs (user_id, type, channel, status, payload, attempts)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING id`,
      [payload.userId, payload.type, payload.channel, NotificationStatus.PENDING, JSON.stringify(payload)]
    );
    return rows[0].id;
  }

  async sendNotification(notificationId: number, payload: NotificationPayload): Promise<void> {
    try {
      if (payload.channel === NotificationChannel.EMAIL || payload.channel === NotificationChannel.BOTH) {
        await this.sendEmail(payload);
      }

      if (payload.channel === NotificationChannel.PUSH || payload.channel === NotificationChannel.BOTH) {
        await this.sendPush(payload);
      }

      await this.updateNotificationStatus(notificationId, NotificationStatus.SENT);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateNotificationStatus(notificationId, NotificationStatus.FAILED, errorMessage);
      throw error;
    }
  }

  private async sendEmail(payload: NotificationPayload): Promise<void> {
    if (!payload.email) {
      throw new Error('Email address is required for email notifications');
    }

    const template = await this.templateService.getEmailTemplate(payload.type);
    if (!template) {
      throw new Error(`Email template not found for type: ${payload.type}`);
    }

    const variables = payload.variables || {};
    const subject = payload.subject || this.templateService.renderTemplate(template.subject, variables);
    const htmlBody = this.templateService.renderTemplate(template.htmlBody, variables);
    const textBody = this.templateService.renderTemplate(template.textBody, variables);

    await this.emailService.sendEmail(payload.email, subject, htmlBody, textBody);
  }

  private async sendPush(payload: NotificationPayload): Promise<void> {
    if (!payload.fcmToken) {
      throw new Error('FCM token is required for push notifications');
    }

    if (!this.firebaseService.isInitialized()) {
      throw new Error('Firebase is not initialized');
    }

    const template = await this.templateService.getPushTemplate(payload.type);
    if (!template) {
      throw new Error(`Push template not found for type: ${payload.type}`);
    }

    const variables = payload.variables || {};
    const title = this.templateService.renderTemplate(template.title, variables);
    const body = this.templateService.renderTemplate(template.body, variables);

    await this.firebaseService.sendPushNotification(payload.fcmToken, title, body);
  }

  async updateNotificationStatus(notificationId: number, status: NotificationStatus, error?: string): Promise<void> {
    const sentAt = status === NotificationStatus.SENT ? new Date() : null;
    await query(
      `UPDATE notification_logs 
       SET status = $1, error = $2, sent_at = $3, attempts = attempts + 1, updated_at = NOW()
       WHERE id = $4`,
      [status, error || null, sentAt, notificationId]
    );
  }

  async getNotificationLog(id: number): Promise<NotificationLog | null> {
    const rows = await query<NotificationLog>(
      `SELECT id, user_id as "userId", type, channel, status, payload, error, attempts,
              sent_at as "sentAt", created_at as "createdAt", updated_at as "updatedAt"
       FROM notification_logs WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async getNotificationsByUser(userId: number, limit = 50): Promise<NotificationLog[]> {
    return query<NotificationLog>(
      `SELECT id, user_id as "userId", type, channel, status, payload, error, attempts,
              sent_at as "sentAt", created_at as "createdAt", updated_at as "updatedAt"
       FROM notification_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
  }
}
