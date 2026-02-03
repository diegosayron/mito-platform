import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import config from '../config';
import { QueueName, SchedulingJobData, SchedulingResult } from '../types';
import { schedulingService } from '../modules/scheduling';

/**
 * Worker for content scheduling and publication jobs
 */
export const createSchedulingWorker = (): Worker => {
  return new Worker(
    QueueName.SCHEDULING,
    async (job: Job<SchedulingJobData>) => {
      console.log(`Processing scheduling job ${job.id}`);

      try {
        // Execute scheduling
        const result: SchedulingResult = await schedulingService.execute(job.data);

        console.log(
          `Scheduling job ${job.id} completed. Content ${result.contentId} ${result.status}.`
        );
        return result;
      } catch (error) {
        console.error(`Scheduling job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: config.queue.concurrency,
    }
  );
};
