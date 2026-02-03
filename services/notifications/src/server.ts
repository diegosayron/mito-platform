import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { loadConfig } from './config';
import { initDatabase } from './database';
import { initQueue } from './queues';
import { EmailService } from './services/email.service';
import { FirebaseService } from './services/firebase.service';
import { TemplateService } from './services/template.service';
import { NotificationService } from './services/notification.service';
import { notificationRoutes } from './routes/notifications';

async function start() {
  const config = loadConfig();

  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'debug' : 'info',
      transport:
        config.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register plugins
  await fastify.register(helmet);
  await fastify.register(cors, {
    origin: true,
  });
  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
  });

  // Initialize database
  initDatabase(config);

  // Initialize queue
  initQueue(config);

  // Initialize services
  const emailService = new EmailService(config);
  const firebaseService = new FirebaseService(config);
  const templateService = new TemplateService();
  const notificationService = new NotificationService(emailService, firebaseService, templateService);

  // Register routes
  await notificationRoutes(fastify, notificationService, templateService);

  // Health check
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'notifications',
    };
  });

  // Start server
  try {
    await fastify.listen({ port: config.port, host: config.host });
    fastify.log.info(`Notification service listening on ${config.host}:${config.port}`);
    
    // Verify email connection if configured
    if (config.smtp.user && config.smtp.pass) {
      const emailConnected = await emailService.verifyConnection();
      if (emailConnected) {
        fastify.log.info('SMTP connection verified successfully');
      } else {
        fastify.log.warn('SMTP connection verification failed');
      }
    } else {
      fastify.log.warn('SMTP not configured');
    }

    // Check Firebase initialization
    if (firebaseService.isInitialized()) {
      fastify.log.info('Firebase initialized successfully');
    } else {
      fastify.log.warn('Firebase not initialized');
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
