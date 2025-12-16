-- Enhanced AI Learning Platform Database Schema
-- Supports soft deletes, audit fields, and advanced features

USE ai_learning_platform;

-- Enhanced Users table (already exists, but let's ensure it has all fields)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NULL,
ADD INDEX IF NOT EXISTS idx_archived (archived_at),
ADD INDEX IF NOT EXISTS idx_role_archived (role, archived_at);

-- Learning Tasks table with enhanced features
CREATE TABLE IF NOT EXISTS learning_tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  status ENUM('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED') DEFAULT 'TODO',
  due_date TIMESTAMP NULL,
  estimated_time INT NULL COMMENT 'in minutes',
  actual_time INT NULL COMMENT 'in minutes',
  tags JSON DEFAULT ('[]'),
  difficulty_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
  
  -- Relationships
  creator_id VARCHAR(255) NOT NULL,
  assignee_id VARCHAR(255) NULL,
  parent_task_id VARCHAR(255) NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  
  -- Foreign keys
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_task_id) REFERENCES learning_tasks(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_creator_status (creator_id, status, archived_at),
  INDEX idx_assignee_status (assignee_id, status, archived_at),
  INDEX idx_due_date (due_date),
  INDEX idx_created_at (created_at),
  INDEX idx_archived (archived_at),
  INDEX idx_parent_task (parent_task_id),
  INDEX idx_priority_status (priority, status)
);

-- Progress Logs table
CREATE TABLE IF NOT EXISTS progress_logs (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  time_spent INT NULL COMMENT 'in minutes',
  completion_evidence TEXT NULL COMMENT 'URLs, descriptions, etc.',
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  
  -- Foreign keys
  FOREIGN KEY (task_id) REFERENCES learning_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_task_created (task_id, created_at),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_archived (archived_at),
  INDEX idx_progress (progress_percentage)
);

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  task_id VARCHAR(255) NULL,
  insight_type ENUM('TASK_BREAKDOWN', 'PROGRESS_SUMMARY', 'STUDY_SUGGESTION', 'PERFORMANCE_ANALYSIS') NOT NULL,
  title VARCHAR(500) NOT NULL,
  content JSON NOT NULL,
  metadata JSON NULL COMMENT 'AI model info, tokens used, etc.',
  confidence_score DECIMAL(3,2) NULL COMMENT '0.00 to 1.00',
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  
  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES learning_tasks(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_user_type (user_id, insight_type, archived_at),
  INDEX idx_task_type (task_id, insight_type),
  INDEX idx_created_at (created_at),
  INDEX idx_archived (archived_at)
);

-- Task Categories table (for better organization)
CREATE TABLE IF NOT EXISTS task_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Hex color code',
  creator_id VARCHAR(255) NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  
  -- Foreign keys
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_creator_archived (creator_id, archived_at),
  INDEX idx_name (name)
);

-- Task-Category relationship table
CREATE TABLE IF NOT EXISTS task_category_relations (
  task_id VARCHAR(255),
  category_id VARCHAR(255),
  PRIMARY KEY (task_id, category_id),
  
  FOREIGN KEY (task_id) REFERENCES learning_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES task_categories(id) ON DELETE CASCADE
);

-- Rate limiting table for AI requests
CREATE TABLE IF NOT EXISTS ai_rate_limits (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_user_endpoint (user_id, endpoint),
  INDEX idx_window_start (window_start),
  
  -- Unique constraint for rate limiting
  UNIQUE KEY unique_user_endpoint_window (user_id, endpoint, window_start)
);

-- Notifications table (for future enhancements)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(1000) NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  
  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_user_read (user_id, is_read, archived_at),
  INDEX idx_created_at (created_at)
);