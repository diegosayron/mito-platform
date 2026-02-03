import 'dotenv/config';
import { loadConfig } from './config';
import { initDatabase } from './database';
import { EmailService } from './services/email.service';
import { FirebaseService } from './services/firebase.service';
import { TemplateService } from './services/template.service';
import { NotificationService } from './services/notification.service';
import { NotificationWorker } from './workers/notification.worker';

async function start() {
  console.log('Starting notification worker...');

  const config = loadConfig();

  // Initialize database
  initDatabase(config);

  // Initialize services
  const emailService = new EmailService(config);
  const firebaseService = new FirebaseService(config);
  const templateService = new TemplateService();
  const notificationService = new NotificationService(emailService, firebaseService, templateService);

  // Initialize worker
  const worker = new NotificationWorker(config, notificationService);

  console.log('Notification worker started successfully');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing worker...');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing worker...');
    await worker.close();
    process.exit(0);
  });
}

start().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
