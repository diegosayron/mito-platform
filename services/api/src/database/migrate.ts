import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import config from '../config';

/**
 * Migration runner for PostgreSQL database
 * Runs pure SQL migrations from the migrations directory
 */

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
});

/**
 * Create migrations tracking table if it doesn't exist
 */
const createMigrationsTable = async (): Promise<void> => {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

/**
 * Get list of executed migrations
 */
const getExecutedMigrations = async (): Promise<Set<string>> => {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return new Set(result.rows.map((row: { name: string }) => row.name));
};

/**
 * Mark migration as executed
 */
const markMigrationExecuted = async (name: string): Promise<void> => {
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
};

/**
 * Run all pending migrations
 */
const runMigrations = async (): Promise<void> => {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Ensure migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    return;
  }

  // Get migration files
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found');
    return;
  }

  // Create migrations table
  await createMigrationsTable();

  // Get already executed migrations
  const executed = await getExecutedMigrations();

  // Run pending migrations
  for (const file of files) {
    if (executed.has(file)) {
      console.log(`⏭️  Skipping already executed migration: ${file}`);
      continue;
    }

    console.log(`🔄 Running migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      // Start transaction
      await pool.query('BEGIN');
      
      // Execute migration
      await pool.query(sql);
      
      // Mark as executed
      await markMigrationExecuted(file);
      
      // Commit transaction
      await pool.query('COMMIT');
      
      console.log(`✅ Migration completed: ${file}`);
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      console.error(`❌ Migration failed: ${file}`);
      throw error;
    }
  }

  console.log('🎉 All migrations completed successfully');
};

/**
 * Main execution
 */
const main = async () => {
  try {
    console.log('Starting database migrations...');
    console.log(`Database: ${config.database.name}@${config.database.host}:${config.database.port}`);
    
    await runMigrations();
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await pool.end();
    process.exit(1);
  }
};

main();
