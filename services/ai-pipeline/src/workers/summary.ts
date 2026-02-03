import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import config from '../config';
import { QueueName, SummaryJobData, SummaryResult } from '../types';
import { summaryService } from '../modules/summary';
import { getVideoQueue } from '../queues';

/**
 * Worker for AI summary jobs
 */
export const createSummaryWorker = (): Worker => {
  return new Worker(
    QueueName.SUMMARY,
    async (job: Job<SummaryJobData>) => {
      console.log(`Processing summary job ${job.id}`);

      try {
        // Execute AI summarization
        const result: SummaryResult = await summaryService.execute(job.data);

        // Add to video generation queue
        const videoQueue = getVideoQueue();
        await videoQueue.add('generate-video', {
          jobId: job.data.jobId,
          summaryResult: result,
        });

        console.log(`Summary job ${job.id} completed using ${result.aiModel}.`);
        return result;
      } catch (error) {
        console.error(`Summary job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: config.queue.concurrency,
    }
  );
};
