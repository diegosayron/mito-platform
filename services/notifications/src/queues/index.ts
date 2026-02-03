import { Queue, QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';
import { Config } from '../config';
import { QueueJobData } from '../types';

let notificationQueue: Queue<QueueJobData> | null = null;

export function initQueue(config: Config): Queue<QueueJobData> {
  if (notificationQueue) {
    return notificationQueue;
  }

  const connection = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null,
  });

  const queueOptions: QueueOptions = {
    connection,
    defaultJobOptions: {
      attempts: config.retry.maxAttempts,
      backoff: {
        type: 'exponential',
        delay: config.retry.delay,
      },
      removeOnComplete: {
        count: 100,
        age: 3600 * 24, // 24 hours
      },
      removeOnFail: {
        count: 1000,
        age: 3600 * 24 * 7, // 7 days
      },
    },
  };

  notificationQueue = new Queue<QueueJobData>('notifications', queueOptions);

  return notificationQueue;
}

export function getQueue(): Queue<QueueJobData> {
  if (!notificationQueue) {
    throw new Error('Queue not initialized. Call initQueue first.');
  }
  return notificationQueue;
}

export async function addNotificationJob(jobData: QueueJobData): Promise<void> {
  const queue = getQueue();
  await queue.add('send-notification', jobData, {
    jobId: `notification-${jobData.notificationId}`,
  });
}

export async function closeQueue(): Promise<void> {
  if (notificationQueue) {
    await notificationQueue.close();
    notificationQueue = null;
  }
}
