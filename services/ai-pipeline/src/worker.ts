import { createScrapingWorker } from './workers/scraping';
import { createCleaningWorker } from './workers/cleaning';
import { createSummaryWorker } from './workers/summary';
import { createVideoWorker } from './workers/video';
import { createSchedulingWorker } from './workers/scheduling';
import { closeAllQueues } from './queues';
import { closeRedisConnection } from './config/redis';
import { scrapingService } from './modules/scraping';

/**
 * Main worker process for AI Pipeline
 * Starts all BullMQ workers
 */

console.log('Starting AI Pipeline Workers...');

// Create all workers
const scrapingWorker = createScrapingWorker();
const cleaningWorker = createCleaningWorker();
const summaryWorker = createSummaryWorker();
const videoWorker = createVideoWorker();
const schedulingWorker = createSchedulingWorker();

console.log('All workers started successfully');

// Worker event handlers
scrapingWorker.on('completed', (job) => {
  console.log(`✓ Scraping job ${job.id} completed`);
});

scrapingWorker.on('failed', (job, err) => {
  console.error(`✗ Scraping job ${job?.id} failed:`, err.message);
});

cleaningWorker.on('completed', (job) => {
  console.log(`✓ Cleaning job ${job.id} completed`);
});

cleaningWorker.on('failed', (job, err) => {
  console.error(`✗ Cleaning job ${job?.id} failed:`, err.message);
});

summaryWorker.on('completed', (job) => {
  console.log(`✓ Summary job ${job.id} completed`);
});

summaryWorker.on('failed', (job, err) => {
  console.error(`✗ Summary job ${job?.id} failed:`, err.message);
});

videoWorker.on('completed', (job) => {
  console.log(`✓ Video job ${job.id} completed`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`✗ Video job ${job?.id} failed:`, err.message);
});

schedulingWorker.on('completed', (job) => {
  console.log(`✓ Scheduling job ${job.id} completed`);
});

schedulingWorker.on('failed', (job, err) => {
  console.error(`✗ Scheduling job ${job?.id} failed:`, err.message);
});

/**
 * Graceful shutdown
 */
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing workers...');

  try {
    // Close all workers
    await Promise.all([
      scrapingWorker.close(),
      cleaningWorker.close(),
      summaryWorker.close(),
      videoWorker.close(),
      schedulingWorker.close(),
    ]);

    // Close scraping service browser
    await scrapingService.closeBrowser();

    // Close all queues
    await closeAllQueues();

    // Close Redis connection
    await closeRedisConnection();

    console.log('All workers closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});
