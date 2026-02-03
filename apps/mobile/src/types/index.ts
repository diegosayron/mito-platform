// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  status: 'free' | 'active_subscriber' | 'expired_subscriber' | 'admin';
  created_at: string;
  avatar_url?: string;
}

// Auth types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

// Content types
export type ContentType = 'history' | 'character' | 'great_work' | 'video' | 'bible_verse';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  body: string;
  tags: string[];
  media_id?: string;
  media_url?: string;
  thumbnail_url?: string;
  source?: string;
  status: 'draft' | 'scheduled' | 'published' | 'hidden';
  publish_at?: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
}

// Comment types
export interface Comment {
  id: string;
  content_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  text: string;
  like_count: number;
  is_liked?: boolean;
  blocked: boolean;
  created_at: string;
  replies?: Comment[];
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  rule: string;
  unlocked?: boolean;
  unlocked_at?: string;
}

// Sticker types
export interface StickerPack {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  required_badge_id?: string;
  unlocked: boolean;
}

export interface Sticker {
  id: string;
  pack_id: string;
  image_url: string;
  name: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'push' | 'email' | 'campaign';
  title: string;
  message: string;
  payload?: Record<string, any>;
  read: boolean;
  created_at: string;
}

// Campaign types
export interface Campaign {
  id: string;
  title: string;
  image_url: string;
  link?: string;
  start_at: string;
  end_at: string;
}

// Report types
export type ReportTargetType = 'content' | 'comment' | 'user';

export interface Report {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
