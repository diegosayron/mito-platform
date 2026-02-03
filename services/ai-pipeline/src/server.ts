import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import config from './config';
import { getScrapingQueue } from './queues';

const fastify = Fastify({
  logger: {
    transport:
      config.server.env === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

/**
 * Register plugins
 */
const registerPlugins = async () => {
  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: config.server.env === 'production',
  });

  // CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });
};

/**
 * Register routes
 */
const registerRoutes = async () => {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'ai-pipeline', timestamp: new Date().toISOString() };
  });

  // Start pipeline endpoint (for testing/admin portal)
  fastify.post<{
    Body: { query: string; userId: string; maxPages?: number };
  }>('/api/v1/pipeline/start', async (request, reply) => {
    const { query, userId, maxPages } = request.body;

    if (!query || !userId) {
      return reply.code(400).send({ error: 'Missing required fields: query, userId' });
    }

    // Use crypto.randomUUID for guaranteed unique IDs
    const jobId = `pipeline-${Date.now()}-${crypto.randomUUID()}`;

    // Add job to scraping queue
    const scrapingQueue = getScrapingQueue();
    await scrapingQueue.add('scrape', {
      jobId,
      query,
      userId,
      maxPages,
    });

    return { jobId, status: 'started', message: 'Pipeline started successfully' };
  });

  // Get job status endpoint
  fastify.get<{
    Params: { jobId: string };
  }>('/api/v1/pipeline/status/:jobId', async (request, reply) => {
    const { jobId } = request.params;

    // Not implemented yet - return 501
    return reply.code(501).send({ 
      error: 'Not Implemented',
      message: 'Job status tracking will be implemented in a future version',
      jobId 
    });
  });
};

/**
 * Start server
 */
const start = async () => {
  try {
    // Register plugins
    await registerPlugins();
    fastify.log.info('Plugins registered successfully');

    // Register routes
    await registerRoutes();
    fastify.log.info('Routes registered successfully');

    // Start listening
    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    });

    fastify.log.info(
      `AI Pipeline Server listening on ${config.server.host}:${config.server.port}`
    );
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async () => {
  fastify.log.info('Received shutdown signal, closing server...');
  try {
    await fastify.close();
    fastify.log.info('Server closed gracefully');
    process.exit(0);
  } catch (error) {
    fastify.log.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
start();

export default fastify;
