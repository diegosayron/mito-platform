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

    const authHeaderTrimmed = authHeader.trim();
    const [scheme, ...credentialsParts] = authHeaderTrimmed.split(/\s+/);

    if (!scheme || scheme.toLowerCase() !== 'bearer') {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid authorization scheme',
      });
    }

    const token = credentialsParts.join(' ').trim();

    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing token',
      });
    }

    const payload = verifyAccessToken(token);
    request.user = payload;
    return;
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
};
