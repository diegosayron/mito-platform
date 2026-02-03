import { FastifyInstance } from 'fastify';
import { NotificationService } from '../services/notification.service';
import { TemplateService } from '../services/template.service';
import { addNotificationJob } from '../queues';
import { NotificationPayload } from '../types';

export async function notificationRoutes(
  fastify: FastifyInstance,
  notificationService: NotificationService,
  templateService: TemplateService
) {
  // Send notification
  fastify.post<{
    Body: NotificationPayload;
  }>('/api/notifications/send', async (request, reply) => {
    try {
      const payload = request.body;

      // Validate payload
      if (!payload.userId || !payload.type || !payload.channel) {
        return reply.code(400).send({ error: 'Missing required fields: userId, type, channel' });
      }

      // Create notification log
      const notificationId = await notificationService.createNotification(payload);

      // Add to queue
      await addNotificationJob({
        notificationId,
        payload,
        attempt: 1,
      });

      return reply.code(201).send({
        success: true,
        notificationId,
        message: 'Notification queued successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to queue notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get notification by ID
  fastify.get<{
    Params: { id: string };
  }>('/api/notifications/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id, 10);
      const notification = await notificationService.getNotificationLog(id);

      if (!notification) {
        return reply.code(404).send({ error: 'Notification not found' });
      }

      return reply.send(notification);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get notification' });
    }
  });

  // Get user notifications
  fastify.get<{
    Params: { userId: string };
    Querystring: { limit?: string };
  }>('/api/notifications/user/:userId', async (request, reply) => {
    try {
      const userId = parseInt(request.params.userId, 10);
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 50;

      const notifications = await notificationService.getNotificationsByUser(userId, limit);

      return reply.send(notifications);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get notifications' });
    }
  });

  // Get all email templates
  fastify.get('/api/notifications/templates/email', async (_request, reply) => {
    try {
      const templates = await templateService.getAllEmailTemplates();
      return reply.send(templates);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get email templates' });
    }
  });

  // Get all push templates
  fastify.get('/api/notifications/templates/push', async (_request, reply) => {
    try {
      const templates = await templateService.getAllPushTemplates();
      return reply.send(templates);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get push templates' });
    }
  });

  // Update email template
  fastify.put<{
    Params: { id: string };
    Body: { subject: string; htmlBody: string; textBody: string };
  }>('/api/notifications/templates/email/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id, 10);
      const { subject, htmlBody, textBody } = request.body;

      if (!subject || !htmlBody || !textBody) {
        return reply.code(400).send({ error: 'Missing required fields: subject, htmlBody, textBody' });
      }

      await templateService.updateEmailTemplate(id, subject, htmlBody, textBody);

      return reply.send({ success: true, message: 'Email template updated successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update email template' });
    }
  });

  // Update push template
  fastify.put<{
    Params: { id: string };
    Body: { title: string; body: string };
  }>('/api/notifications/templates/push/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id, 10);
      const { title, body } = request.body;

      if (!title || !body) {
        return reply.code(400).send({ error: 'Missing required fields: title, body' });
      }

      await templateService.updatePushTemplate(id, title, body);

      return reply.send({ success: true, message: 'Push template updated successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update push template' });
    }
  });
}
