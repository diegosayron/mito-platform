import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import config from '../config';
import { QueueName, CleaningJobData, CleaningResult } from '../types';
import { cleaningService } from '../modules/cleaning';
import { getSummaryQueue } from '../queues';

/**
 * Worker for cleaning jobs
 */
export const createCleaningWorker = (): Worker => {
  return new Worker(
    QueueName.CLEANING,
    async (job: Job<CleaningJobData>) => {
      console.log(`Processing cleaning job ${job.id}`);

      try {
        // Execute cleaning
        const result: CleaningResult = await cleaningService.execute(job.data);

        // If cleaning successful, add to summary queue
        if (result.cleanedContent.length > 0) {
          const summaryQueue = getSummaryQueue();
          await summaryQueue.add('summarize', {
            jobId: job.data.jobId,
            cleaningResult: result,
          });

          console.log(`Cleaning job ${job.id} completed. Cleaned ${result.cleanedContent.length} items.`);
        } else {
          console.warn(`Cleaning job ${job.id} completed but no content remained after cleaning.`);
        }

        return result;
      } catch (error) {
        console.error(`Cleaning job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: config.queue.concurrency,
    }
  );
};
