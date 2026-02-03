# Database Migrations

This directory contains the PostgreSQL database migrations for the MITO platform.

## Overview

The migration system uses pure SQL scripts (no ORM) and tracks executed migrations in a `migrations` table.

## Environment Variables

Configure the database connection using the following environment variables (PG_* takes precedence over DB_*):

- `PG_HOST` (or `DB_HOST`) - PostgreSQL host (default: localhost)
- `PG_PORT` (or `DB_PORT`) - PostgreSQL port (default: 5432)
- `PG_DATABASE` (or `DB_NAME`) - Database name (default: mito_db)
- `PG_USER` (or `DB_USER`) - Database user (default: mito_user)
- `PG_PASSWORD` (or `DB_PASSWORD`) - Database password (default: mito_password)
- `DB_POOL_MIN` - Minimum pool connections (default: 2)
- `DB_POOL_MAX` - Maximum pool connections (default: 10)

## Running Migrations

To run all pending migrations in development:

```bash
npm run migrate
```

To run migrations in production (after building):

```bash
npm run build
npm run migrate:prod
```

This will:
1. Create a `migrations` table if it doesn't exist
2. Check which migrations have already been executed
3. Run pending migrations in order
4. Track executed migrations to prevent re-running

## Migration Files

Migration files are located in `src/database/migrations/` and follow the naming convention:
- `001_initial_schema.sql`
- `002_description.sql`
- etc.

### Key Features

- **Idempotent**: Uses `IF NOT EXISTS` clauses to safely run migrations multiple times
- **Transactional**: Each migration runs in a transaction
- **Tracked**: Executed migrations are recorded in the `migrations` table
- **Pure SQL**: No ORM, just SQL statements

## Initial Schema

The initial migration (`001_initial_schema.sql`) creates the following tables:

1. **users** - User accounts with authentication
2. **subscriptions** - User subscription plans and status
3. **contents** - Content items (articles, videos, etc.)
4. **media_files** - Media storage metadata
5. **comments** - User comments on content
6. **reports** - User reports for moderation
7. **campaigns** - Marketing campaigns
8. **notifications** - User notifications
9. **badges** - Achievement badges
10. **user_badges** - User badge assignments

Each table includes:
- Primary key
- Timestamps (created_at, updated_at)
- Foreign keys where applicable
- Indexes for efficient queries
- Automatic updated_at triggers

## Creating New Migrations

1. Create a new `.sql` file in `src/database/migrations/`
2. Use a sequential number prefix (e.g., `002_add_new_feature.sql`)
3. Write idempotent SQL using `IF NOT EXISTS` clauses
4. Run `npm run migrate` to apply the migration

### Example Migration

```sql
-- Add a new column safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  END IF;
END $$;

-- Note: For timestamp columns with updated_at, you'll need to ensure
-- the update_updated_at_column() trigger is applied to the table
```

## Database Connection Pool

The database module provides a connection pool configured with:
- Minimum connections: configurable via `DB_POOL_MIN`
- Maximum connections: configurable via `DB_POOL_MAX`
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

### Usage

```typescript
import { query, getClient } from './database';

// Simple query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
const client = await getClient();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO subscriptions ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```
