-- Enhanced AI Learning Platform Database Schema
USE ai_learning_platform;

-- Learning Tasks table
DROP TABLE IF EXISTS learning_tasks;
CREATE TABLE learning_tasks (
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
  
  -- Indexes
  INDEX idx_creator_status (creator_id, status, archived_at),
  INDEX idx_assignee_status (assignee_id, status, archived_at),
  INDEX idx_due_date (due_date),
  INDEX idx_created_at (created_at),
  INDEX idx_archived (archived_at)
);

-- Progress Logs table
DROP TABLE IF EXISTS progress_logs;
CREATE TABLE progress_logs (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  progress_percentage INT NOT NULL DEFAULT 0,
  notes TEXT,
  time_spent INT NULL COMMENT 'in minutes',
  completion_evidence TEXT NULL,
  
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
  INDEX idx_archived (archived_at)
);

-- AI Insights table
DROP TABLE IF EXISTS ai_insights;
CREATE TABLE ai_insights (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  task_id VARCHAR(255) NULL,
  insight_type ENUM('TASK_BREAKDOWN', 'PROGRESS_SUMMARY', 'STUDY_SUGGESTION', 'PERFORMANCE_ANALYSIS') NOT NULL,
  title VARCHAR(500) NOT NULL,
  content JSON NOT NULL,
  metadata JSON NULL,
  confidence_score DECIMAL(3,2) NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  
  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES learning_tasks(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_user_type (user_id, insight_type, archived_at),
  INDEX idx_created_at (created_at)
);

-- Rate limiting table
DROP TABLE IF EXISTS ai_rate_limits;
CREATE TABLE ai_rate_limits (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_endpoint (user_id, endpoint),
  UNIQUE KEY unique_user_endpoint_window (user_id, endpoint, window_start)
);