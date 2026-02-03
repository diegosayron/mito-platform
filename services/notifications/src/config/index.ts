export interface Config {
  nodeEnv: string;
  port: number;
  host: string;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
  };
  firebase: {
    key: string;
  };
  retry: {
    maxAttempts: number;
    delay: number;
  };
  rateLimit: {
    max: number;
    timeWindow: number;
  };
}

export function loadConfig(): Config {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3003', 10),
    host: process.env.HOST || '0.0.0.0',
    database: {
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT || '5432', 10),
      database: process.env.PG_DATABASE || 'mito_db',
      user: process.env.PG_USER || 'mito_user',
      password: process.env.PG_PASSWORD || 'mito_password',
      poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
      poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'noreply@mito.com',
      secure: process.env.SMTP_SECURE === 'true',
    },
    firebase: {
      key: process.env.FIREBASE_KEY || '',
    },
    retry: {
      maxAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
      delay: parseInt(process.env.RETRY_DELAY || '5000', 10),
    },
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000', 10),
    },
  };
}
