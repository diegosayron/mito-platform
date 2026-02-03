import { Pool, PoolClient } from 'pg';
import config from '../config';

let pool: Pool | null = null;

/**
 * Initialize PostgreSQL connection pool
 */
export const initDatabase = async (): Promise<Pool> => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    min: config.database.poolMin,
    max: config.database.poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    statement_timeout: 30000, // 30 seconds
    query_timeout: 30000, // 30 seconds
  });

  // Test connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return pool;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to connect to database: ${errorMessage}`);
  }
};

/**
 * Get database pool instance
 */
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase first.');
  }
  return pool;
};

/**
 * Execute a query
 */
export const query = async (text: string, params?: unknown[]) => {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

/**
 * Get a client for transactions
 */
export const getClient = async (): Promise<PoolClient> => {
  return await getPool().connect();
};

/**
 * Close database connection pool
 */
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
