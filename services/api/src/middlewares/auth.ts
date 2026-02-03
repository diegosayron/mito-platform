import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

/**
 * Authentication middleware - validates JWT token
 */
export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing authorization header',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing token',
      });
    }

    const payload = verifyAccessToken(token);
    request.user = payload;
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
};
