import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { Config } from '../config';
import { QueueJobData, NotificationStatus } from '../types';
import { NotificationService } from '../services/notification.service';

export class NotificationWorker {
  private worker: Worker<QueueJobData>;

  constructor(
    config: Config,
    private notificationService: NotificationService
  ) {
    const connection = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
    });

    this.worker = new Worker<QueueJobData>(
      'notifications',
      async (job: Job<QueueJobData>) => {
        await this.processNotification(job);
      },
      {
        connection,
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 1000, // 10 jobs per second
        },
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });
  }

  private async processNotification(job: Job<QueueJobData>): Promise<void> {
    const { notificationId, payload, attempt } = job.data;

    console.log(`Processing notification ${notificationId}, attempt ${attempt}`);

    try {
      // Update status to retrying if this is not the first attempt
      if (attempt > 1) {
        await this.notificationService.updateNotificationStatus(
          notificationId,
          NotificationStatus.RETRYING
        );
      }

      // Send the notification
      await this.notificationService.sendNotification(notificationId, payload);

      console.log(`Notification ${notificationId} sent successfully`);
    } catch (error) {
      console.error(`Failed to process notification ${notificationId}:`, error);
      
      // The error will be caught by BullMQ and retried based on job options
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.worker.close();
  }
}
