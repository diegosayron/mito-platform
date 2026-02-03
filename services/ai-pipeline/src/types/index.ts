/**
 * Job data types for each stage of the pipeline
 */

export interface ScrapingJobData {
  jobId: string;
  query: string;
  userId: string;
  maxPages?: number;
}

export interface ScrapingResult {
  jobId: string;
  query: string;
  results: Array<{
    url: string;
    title: string;
    content: string;
    sourceDate?: string;
  }>;
  sources: string[];
  scrapedAt: Date;
}

export interface CleaningJobData {
  jobId: string;
  scrapingResult: ScrapingResult;
}

export interface CleaningResult {
  jobId: string;
  cleanedContent: Array<{
    url: string;
    title: string;
    cleanText: string;
    wordCount: number;
  }>;
  processedAt: Date;
}

export interface SummaryJobData {
  jobId: string;
  cleaningResult: CleaningResult;
  maxLength?: number;
}

export interface SummaryResult {
  jobId: string;
  summary: string;
  keyPoints: string[];
  sources: string[];
  aiModel: string;
  generatedAt: Date;
}

export interface VideoJobData {
  jobId: string;
  summaryResult: SummaryResult;
  videoTemplate?: string;
}

export interface VideoResult {
  jobId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  generatedAt: Date;
}

export interface SchedulingJobData {
  jobId: string;
  contentData: {
    type: 'História' | 'Personagem' | 'Grande Obra' | 'Vídeo' | 'Trecho Bíblico';
    title: string;
    body: string;
    sources: string[];
    mediaUrl?: string;
  };
  scheduleAt?: Date;
}

export interface SchedulingResult {
  jobId: string;
  contentId: string;
  status: 'scheduled' | 'published';
  scheduledAt?: Date;
  publishedAt?: Date;
}

/**
 * Queue names
 */
export enum QueueName {
  SCRAPING = 'ai-pipeline:scraping',
  CLEANING = 'ai-pipeline:cleaning',
  SUMMARY = 'ai-pipeline:summary',
  VIDEO = 'ai-pipeline:video',
  SCHEDULING = 'ai-pipeline:scheduling',
}

/**
 * Job status
 */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
