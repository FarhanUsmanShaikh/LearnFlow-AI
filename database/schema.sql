-- AI Learning Platform Database Schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ai_learning_platform;
USE ai_learning_platform;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  role ENUM('STUDENT', 'EDUCATOR', 'ADMIN') DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Sessions table (for future use)
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);

-- Learning tasks table
CREATE TABLE IF NOT EXISTS learning_tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  status ENUM('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED') DEFAULT 'TODO',
  due_date TIMESTAMP NULL,
  estimated_time INT NULL COMMENT 'in minutes',
  actual_time INT NULL COMMENT 'in minutes',
  tags JSON DEFAULT ('[]'),
  creator_id VARCHAR(255) NOT NULL,
  assignee_id VARCHAR(255) NULL,
  parent_task_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id),
  FOREIGN KEY (assignee_id) REFERENCES users(id),
  FOREIGN KEY (parent_task_id) REFERENCES learning_tasks(id),
  INDEX idx_creator_status (creator_id, status),
  INDEX idx_assignee_status (assignee_id, status),
  INDEX idx_due_date (due_date),
  INDEX idx_created_at (created_at)
);

-- Progress logs table
CREATE TABLE IF NOT EXISTS progress_logs (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  progress INT NOT NULL COMMENT '0-100 percentage',
  notes TEXT,
  time_spent INT NULL COMMENT 'in minutes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES learning_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_task_created (task_id, created_at),
  INDEX idx_user_created (user_id, created_at)
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type ENUM('TASK_BREAKDOWN', 'PROGRESS_SUMMARY', 'STUDY_SUGGESTION', 'PERFORMANCE_ANALYSIS') NOT NULL,
  content JSON NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_type (user_id, type),
  INDEX idx_created_at (created_at)
);