import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import config from './config';
import { initDatabase, closeDatabase } from './config/database';
import healthRoutes from './routes/health';

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
    origin: config.cors.origin,
    credentials: true,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
  });
};

/**
 * Register routes
 */
const registerRoutes = async () => {
  // Health check routes
  await fastify.register(healthRoutes);

  // API routes will be added here
  // Example: await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
};

/**
 * Start server
 */
const start = async () => {
  try {
    // Initialize database connection
    fastify.log.info('Initializing database connection...');
    await initDatabase();
    fastify.log.info('Database connected successfully');

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
      `Server listening on ${config.server.host}:${config.server.port}`
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
    await closeDatabase();
    fastify.log.info('Server closed gracefully');
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
start();

export default fastify;
