import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  server: {
    env: string;
    port: number;
    host: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
  minio: {
    endpoint: string;
    port: number;
    accessKey: string;
    secretKey: string;
    useSSL: boolean;
    bucket: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
  rateLimit: {
    max: number;
    timeWindow: number;
  };
  cors: {
    origin: string[];
  };
  cdn: {
    url: string;
  };
  moderation: {
    autoHideReportsThreshold: number;
  };
}

const config: Config = {
  server: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  database: {
    host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || process.env.DB_PORT || '5432', 10),
    name: process.env.PG_DATABASE || process.env.DB_NAME || 'mito_db',
    user: process.env.PG_USER || process.env.DB_USER || 'mito_user',
    password: process.env.PG_PASSWORD || process.env.DB_PASSWORD || 'mito_password',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_JWT_SECRET',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'CHANGE_ME_IN_PRODUCTION_REFRESH_TOKEN_SECRET',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    useSSL: process.env.MINIO_USE_SSL === 'true',
    bucket: process.env.MINIO_BUCKET || 'mito-media',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@mito.com',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
      : ['http://localhost:3001'],
  },
  cdn: {
    url: process.env.CDN_URL || 'https://cdn.example.com',
  },
  moderation: {
    autoHideReportsThreshold: parseInt(process.env.AUTO_HIDE_REPORTS_THRESHOLD || '5', 10),
  },
};

// Validate critical production configurations
if (config.server.env === 'production') {
  const defaultJwtSecret = 'CHANGE_ME_IN_PRODUCTION_JWT_SECRET';
  const defaultRefreshSecret = 'CHANGE_ME_IN_PRODUCTION_REFRESH_TOKEN_SECRET';
  
  if (config.jwt.secret === defaultJwtSecret || !process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET must be set to a secure value in production environment'
    );
  }
  
  if (config.jwt.refreshSecret === defaultRefreshSecret || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error(
      'REFRESH_TOKEN_SECRET must be set to a secure value in production environment'
    );
  }
}

export default config;
