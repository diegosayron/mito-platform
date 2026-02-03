import { FastifyInstance } from 'fastify';
import { getPool } from '../config/database';

export default async function healthRoutes(fastify: FastifyInstance) {
  /**
   * Health check endpoint
   * GET /health
   */
  fastify.get('/health', async (request, reply) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unknown',
      },
    };

    // Check database connection
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      health.services.database = 'ok';
    } catch (error) {
      health.services.database = 'error';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    return reply.status(statusCode).send(health);
  });

  /**
   * Readiness check endpoint
   * GET /ready
   */
  fastify.get('/ready', async (request, reply) => {
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      return reply.status(200).send({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Liveness check endpoint
   * GET /live
   */
  fastify.get('/live', async (request, reply) => {
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });
}
