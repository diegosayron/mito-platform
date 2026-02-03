-- Initial migration: Create all core tables for MITO platform
-- Based on docs/MASTER_SPEC.md section 23

-- ==============================================
-- 1. USERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'free',
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ==============================================
-- 2. SUBSCRIPTIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan VARCHAR(100) NOT NULL,
  start_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_at TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_at ON subscriptions(end_at);

-- ==============================================
-- 3. MEDIA FILES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS media_files (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  cdn_url VARCHAR(1000),
  file_size BIGINT,
  mime_type VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for media_files table
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(type);
CREATE INDEX IF NOT EXISTS idx_media_files_storage_key ON media_files(storage_key);

-- ==============================================
-- 4. CONTENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS contents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  tags TEXT[],
  media_id INTEGER,
  source VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  publish_at TIMESTAMP,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contents_media FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE SET NULL
);

-- Indexes for contents table
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_publish_at ON contents(publish_at);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at);
CREATE INDEX IF NOT EXISTS idx_contents_tags ON contents USING GIN(tags);

-- ==============================================
-- 5. COMMENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  parent_id INTEGER,
  text TEXT NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT false,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_content FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Indexes for comments table
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_blocked ON comments(blocked);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- ==============================================
-- 6. REPORTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(50) NOT NULL,
  target_id INTEGER NOT NULL,
  reporter_user_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  moderator_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for reports table
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_user_id ON reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- ==============================================
-- 7. CAMPAIGNS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  link VARCHAR(1000),
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for campaigns table
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(active);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_at, end_at);

-- ==============================================
-- 8. NOTIFICATIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ==============================================
-- 9. BADGES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  rule JSONB NOT NULL,
  icon_url VARCHAR(1000),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for badges table
CREATE INDEX IF NOT EXISTS idx_badges_name ON badges(name);

-- ==============================================
-- 10. USER_BADGES TABLE (Many-to-Many)
-- ==============================================
CREATE TABLE IF NOT EXISTS user_badges (
  user_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- Indexes for user_badges table
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_awarded_at ON user_badges(awarded_at);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT COLUMNS
-- ==============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
BEGIN
  -- Users table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Subscriptions table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Media files table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_media_files_updated_at') THEN
    CREATE TRIGGER update_media_files_updated_at
      BEFORE UPDATE ON media_files
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Contents table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contents_updated_at') THEN
    CREATE TRIGGER update_contents_updated_at
      BEFORE UPDATE ON contents
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Comments table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at') THEN
    CREATE TRIGGER update_comments_updated_at
      BEFORE UPDATE ON comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Reports table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reports_updated_at') THEN
    CREATE TRIGGER update_reports_updated_at
      BEFORE UPDATE ON reports
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Campaigns table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_campaigns_updated_at') THEN
    CREATE TRIGGER update_campaigns_updated_at
      BEFORE UPDATE ON campaigns
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Notifications table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
    CREATE TRIGGER update_notifications_updated_at
      BEFORE UPDATE ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Badges table
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_badges_updated_at') THEN
    CREATE TRIGGER update_badges_updated_at
      BEFORE UPDATE ON badges
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
