import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    env: string;
    port: number;
    host: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  ai: {
    openaiApiKey?: string;
    geminiApiKey?: string;
  };
  scraping: {
    maxPages: number;
    timeout: number;
    userAgent: string;
  };
  content: {
    maxSummaryLength: number;
    minContentLength: number;
  };
  api: {
    mainApiUrl: string;
    mainApiSecret?: string;
  };
  queue: {
    concurrency: number;
    retryAttempts: number;
    retryDelay: number;
  };
  video: {
    serviceUrl?: string;
    apiKey?: string;
  };
}

const config: Config = {
  server: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
  },
  scraping: {
    maxPages: parseInt(process.env.SCRAPING_MAX_PAGES || '10', 10),
    timeout: parseInt(process.env.SCRAPING_TIMEOUT || '30000', 10),
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (compatible; MitoBot/1.0)',
  },
  content: {
    maxSummaryLength: parseInt(process.env.MAX_SUMMARY_LENGTH || '500', 10),
    minContentLength: parseInt(process.env.MIN_CONTENT_LENGTH || '100', 10),
  },
  api: {
    mainApiUrl: process.env.MAIN_API_URL || 'http://localhost:3000',
    mainApiSecret: process.env.MAIN_API_SECRET,
  },
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '2', 10),
    retryAttempts: parseInt(process.env.JOB_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.JOB_RETRY_DELAY || '5000', 10),
  },
  video: {
    serviceUrl: process.env.VIDEO_SERVICE_URL,
    apiKey: process.env.VIDEO_SERVICE_API_KEY,
  },
};

export default config;
