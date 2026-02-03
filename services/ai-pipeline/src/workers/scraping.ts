import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import config from '../config';
import { QueueName, ScrapingJobData, ScrapingResult } from '../types';
import { scrapingService } from '../modules/scraping';
import { getCleaningQueue } from '../queues';

/**
 * Worker for scraping jobs
 */
export const createScrapingWorker = (): Worker => {
  return new Worker(
    QueueName.SCRAPING,
    async (job: Job<ScrapingJobData>) => {
      console.log(`Processing scraping job ${job.id} for query: "${job.data.query}"`);

      try {
        // Execute scraping
        const result: ScrapingResult = await scrapingService.execute(job.data);

        // If scraping successful, add to cleaning queue
        if (result.results.length > 0) {
          const cleaningQueue = getCleaningQueue();
          await cleaningQueue.add('clean', {
            jobId: job.data.jobId,
            scrapingResult: result,
          });

          console.log(`Scraping job ${job.id} completed. Found ${result.results.length} results.`);
        } else {
          console.warn(`Scraping job ${job.id} completed but found no results.`);
        }

        return result;
      } catch (error) {
        console.error(`Scraping job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: config.queue.concurrency,
    }
  );
};
