import Redis from 'ioredis';
import config from '../config';

let redisConnection: Redis | null = null;

export const getRedisConnection = (): Redis => {
  if (!redisConnection) {
    redisConnection = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null, // Required for BullMQ
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisConnection.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redisConnection.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  return redisConnection;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
};
