import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import config from '../config';
import { QueueName, VideoJobData, VideoResult } from '../types';
import { videoService } from '../modules/video';
import { getSchedulingQueue } from '../queues';

/**
 * Worker for video generation jobs
 */
export const createVideoWorker = (): Worker => {
  return new Worker(
    QueueName.VIDEO,
    async (job: Job<VideoJobData>) => {
      console.log(`Processing video generation job ${job.id}`);

      try {
        // Execute video generation
        const result: VideoResult = await videoService.execute(job.data);

        // Add to scheduling queue
        const schedulingQueue = getSchedulingQueue();
        await schedulingQueue.add('schedule', {
          jobId: job.data.jobId,
          contentData: {
            type: 'Vídeo',
            title: `Conteúdo gerado por IA - ${new Date().toLocaleDateString()}`,
            body: job.data.summaryResult.summary,
            sources: job.data.summaryResult.sources,
            mediaUrl: result.videoUrl,
          },
        });

        console.log(`Video generation job ${job.id} completed.`);
        return result;
      } catch (error) {
        console.error(`Video generation job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: config.queue.concurrency,
    }
  );
};
