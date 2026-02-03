import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import config from '../config';
import { QueueName } from '../types';

// Queue instances
let scrapingQueue: Queue | null = null;
let cleaningQueue: Queue | null = null;
let summaryQueue: Queue | null = null;
let videoQueue: Queue | null = null;
let schedulingQueue: Queue | null = null;

const defaultJobOptions = {
  attempts: config.queue.retryAttempts,
  backoff: {
    type: 'exponential' as const,
    delay: config.queue.retryDelay,
  },
  removeOnComplete: {
    count: 100, // Keep last 100 completed jobs
    age: 24 * 3600, // Keep for 24 hours
  },
  removeOnFail: {
    count: 1000, // Keep last 1000 failed jobs for debugging
  },
};

export const getScrapingQueue = (): Queue => {
  if (!scrapingQueue) {
    scrapingQueue = new Queue(QueueName.SCRAPING, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return scrapingQueue;
};

export const getCleaningQueue = (): Queue => {
  if (!cleaningQueue) {
    cleaningQueue = new Queue(QueueName.CLEANING, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return cleaningQueue;
};

export const getSummaryQueue = (): Queue => {
  if (!summaryQueue) {
    summaryQueue = new Queue(QueueName.SUMMARY, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return summaryQueue;
};

export const getVideoQueue = (): Queue => {
  if (!videoQueue) {
    videoQueue = new Queue(QueueName.VIDEO, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return videoQueue;
};

export const getSchedulingQueue = (): Queue => {
  if (!schedulingQueue) {
    schedulingQueue = new Queue(QueueName.SCHEDULING, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return schedulingQueue;
};

export const closeAllQueues = async (): Promise<void> => {
  const queues = [
    scrapingQueue,
    cleaningQueue,
    summaryQueue,
    videoQueue,
    schedulingQueue,
  ];

  await Promise.all(
    queues.filter((q) => q !== null).map((q) => q!.close())
  );

  scrapingQueue = null;
  cleaningQueue = null;
  summaryQueue = null;
  videoQueue = null;
  schedulingQueue = null;
};
