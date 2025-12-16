import mysql from 'mysql2/promise'

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_learning_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
export const db = mysql.createPool(dbConfig)

// Test connection
export async function testConnection() {
  try {
    const connection = await db.getConnection()
    console.log('✅ Database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Type definitions
export type Role = 'STUDENT' | 'EDUCATOR' | 'ADMIN'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type InsightType = 'TASK_BREAKDOWN' | 'PROGRESS_SUMMARY' | 'STUDY_SUGGESTION' | 'PERFORMANCE_ANALYSIS'

// Entity interfaces
export interface User {
  id: string
  name: string | null
  email: string
  password: string
  emailVerified: boolean
  role: Role
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

export interface LearningTask {
  id: string
  title: string
  description?: string | null
  priority: Priority
  status: TaskStatus
  dueDate?: Date | null
  estimatedTime?: number | null
  actualTime?: number | null
  tags: string[]
  difficultyLevel: DifficultyLevel
  creatorId: string
  assigneeId?: string | null
  parentTaskId?: string | null
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

export interface ProgressLog {
  id: string
  taskId: string
  userId: string
  progressPercentage: number
  notes?: string | null
  timeSpent?: number | null
  completionEvidence?: string | null
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

export interface AIInsight {
  id: string
  userId: string
  taskId?: string | null
  insightType: InsightType
  title: string
  content: any
  metadata?: any | null
  confidenceScore?: number | null
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

// Database helper functions
export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: 'STUDENT' | 'EDUCATOR' | 'ADMIN'
}): Promise<User> {
  const id = generateId('user')
  const now = new Date()
  
  const [result] = await db.execute(
    `INSERT INTO users (id, name, email, password, email_verified, role, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userData.name, userData.email, userData.password, false, userData.role, now, now]
  )

  return {
    id,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    emailVerified: false,
    role: userData.role,
    createdAt: now,
    updatedAt: now,
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) as any[]

  if (rows.length === 0) {
    return null
  }

  const user = rows[0]
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    emailVerified: Boolean(user.email_verified),
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  ) as any[]

  if (rows.length === 0) {
    return null
  }

  const user = rows[0]
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    emailVerified: Boolean(user.email_verified),
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}



// Learning Task functions
export async function createLearningTask(taskData: {
  title: string
  description?: string
  priority?: Priority
  status?: TaskStatus
  dueDate?: Date
  estimatedTime?: number
  tags?: string[]
  difficultyLevel?: DifficultyLevel
  creatorId: string
  assigneeId?: string
  parentTaskId?: string
}): Promise<LearningTask> {
  const id = generateId('task')
  const now = new Date()
  
  await db.execute(
    `INSERT INTO learning_tasks (
      id, title, description, priority, status, due_date, estimated_time, 
      tags, difficulty_level, creator_id, assignee_id, parent_task_id, 
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, taskData.title, taskData.description || null, 
      taskData.priority || 'MEDIUM', taskData.status || 'TODO',
      taskData.dueDate || null, taskData.estimatedTime || null,
      JSON.stringify(taskData.tags || []), taskData.difficultyLevel || 'INTERMEDIATE',
      taskData.creatorId, taskData.assigneeId || null, taskData.parentTaskId || null,
      now, now
    ]
  )

  return {
    id,
    title: taskData.title,
    description: taskData.description || null,
    priority: taskData.priority || 'MEDIUM',
    status: taskData.status || 'TODO',
    dueDate: taskData.dueDate || null,
    estimatedTime: taskData.estimatedTime || null,
    actualTime: null,
    tags: taskData.tags || [],
    difficultyLevel: taskData.difficultyLevel || 'INTERMEDIATE',
    creatorId: taskData.creatorId,
    assigneeId: taskData.assigneeId || null,
    parentTaskId: taskData.parentTaskId || null,
    createdAt: now,
    updatedAt: now,
  }
}

export async function findTasksByUser(userId: string, role: Role, options: {
  status?: TaskStatus
  limit?: number
  offset?: number
  includeArchived?: boolean
} = {}): Promise<LearningTask[]> {
  const { status, limit = 50, offset = 0, includeArchived = false } = options
  
  let query: string
  let params: any[]
  
  if (role === 'EDUCATOR') {
    // Educators see all tasks they created
    query = 'SELECT * FROM learning_tasks WHERE creator_id = ?'
    params = [userId]
  } else if (role === 'ADMIN') {
    // Admins see all tasks
    query = 'SELECT * FROM learning_tasks WHERE 1=1'
    params = []
  } else {
    // Students see:
    // 1. Tasks specifically assigned to them
    // 2. Tasks created by educators that are not assigned to anyone (general tasks)
    // 3. Tasks they created themselves
    query = `
      SELECT * FROM learning_tasks 
      WHERE (
        assignee_id = ? OR 
        creator_id = ? OR 
        (assignee_id IS NULL AND creator_id IN (
          SELECT id FROM users WHERE role = 'EDUCATOR'
        ))
      )
    `
    params = [userId, userId]
  }
  
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  
  if (!includeArchived) {
    query += ' AND archived_at IS NULL'
  }
  
  query += ' ORDER BY created_at DESC'
  
  // Add LIMIT and OFFSET directly to query to avoid parameter binding issues
  if (limit > 0) {
    query += ` LIMIT ${Math.floor(limit)}`
  }
  if (offset > 0) {
    query += ` OFFSET ${Math.floor(offset)}`
  }
  
  const [rows] = await db.execute(query, params) as any[]
  
  return rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date,
    estimatedTime: row.estimated_time,
    actualTime: row.actual_time,
    tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
    difficultyLevel: row.difficulty_level,
    creatorId: row.creator_id,
    assigneeId: row.assignee_id,
    parentTaskId: row.parent_task_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  }))
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, userId: string): Promise<boolean> {
  const [result] = await db.execute(
    'UPDATE learning_tasks SET status = ?, updated_at = NOW() WHERE id = ? AND (creator_id = ? OR assignee_id = ?)',
    [status, taskId, userId, userId]
  ) as any[]
  
  return result.affectedRows > 0
}

// Progress Log functions
export async function createProgressLog(logData: {
  taskId: string
  userId: string
  progressPercentage: number
  notes?: string
  timeSpent?: number
  completionEvidence?: string
}): Promise<ProgressLog> {
  const id = generateId('progress')
  const now = new Date()
  
  await db.execute(
    `INSERT INTO progress_logs (
      id, task_id, user_id, progress, notes, time_spent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id, logData.taskId, logData.userId, logData.progressPercentage,
      logData.notes || null, logData.timeSpent || null, now
    ]
  )

  return {
    id,
    taskId: logData.taskId,
    userId: logData.userId,
    progressPercentage: logData.progressPercentage,
    notes: logData.notes || null,
    timeSpent: logData.timeSpent || null,
    completionEvidence: logData.completionEvidence || null,
    createdAt: now,
    updatedAt: now,
  }
}

export async function getProgressLogsByTask(taskId: string): Promise<ProgressLog[]> {
  const [rows] = await db.execute(
    'SELECT * FROM progress_logs WHERE task_id = ? AND archived_at IS NULL ORDER BY created_at DESC',
    [taskId]
  ) as any[]
  
  return rows.map((row: any) => ({
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    progressPercentage: row.progress,
    notes: row.notes,
    timeSpent: row.time_spent,
    completionEvidence: null, // Not in current schema
    createdAt: row.created_at,
    updatedAt: row.created_at, // Use created_at as updated_at since no updated_at column
    archivedAt: row.archived_at,
  }))
}

// AI Insight functions
export async function createAIInsight(insightData: {
  userId: string
  taskId?: string
  insightType: InsightType
  title: string
  content: any
  metadata?: any
  confidenceScore?: number
}): Promise<AIInsight> {
  const id = generateId('insight')
  const now = new Date()
  
  await db.execute(
    `INSERT INTO ai_insights (
      id, user_id, task_id, insight_type, title, content, metadata, 
      confidence_score, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, insightData.userId, insightData.taskId || null, insightData.insightType,
      insightData.title, JSON.stringify(insightData.content), 
      JSON.stringify(insightData.metadata || {}), insightData.confidenceScore || null,
      now, now
    ]
  )

  return {
    id,
    userId: insightData.userId,
    taskId: insightData.taskId || null,
    insightType: insightData.insightType,
    title: insightData.title,
    content: insightData.content,
    metadata: insightData.metadata || null,
    confidenceScore: insightData.confidenceScore || null,
    createdAt: now,
    updatedAt: now,
  }
}

export async function getAIInsightsByUser(userId: string, type?: InsightType): Promise<AIInsight[]> {
  let query = 'SELECT * FROM ai_insights WHERE user_id = ?'
  const params: any[] = [userId]
  
  if (type) {
    query += ' AND insight_type = ?'
    params.push(type)
  }
  
  query += ' ORDER BY created_at DESC LIMIT 20'
  
  const [rows] = await db.execute(query, params) as any[]
  
  return rows.map((row: any) => {
    let content
    try {
      content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content
    } catch (error) {
      console.warn('Failed to parse AI insight content:', error)
      content = row.content
    }

    let metadata = null
    try {
      metadata = row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : null
    } catch (error) {
      console.warn('Failed to parse AI insight metadata:', error)
      metadata = row.metadata
    }

    return {
      id: row.id,
      userId: row.user_id,
      taskId: row.task_id,
      insightType: row.insight_type,
      title: row.title,
      content,
      metadata,
      confidenceScore: row.confidence_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      archivedAt: row.archived_at || null,
    }
  })
}

// Rate limiting functions
export async function checkRateLimit(userId: string, endpoint: string, maxRequests: number = 10, windowMinutes: number = 60): Promise<boolean> {
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - windowMinutes)
  
  const [rows] = await db.execute(
    'SELECT COUNT(*) as count FROM ai_rate_limits WHERE user_id = ? AND endpoint = ? AND window_start > ?',
    [userId, endpoint, windowStart]
  ) as any[]
  
  const currentCount = rows[0]?.count || 0
  
  if (currentCount >= maxRequests) {
    return false
  }
  
  // Record this request
  await db.execute(
    'INSERT INTO ai_rate_limits (id, user_id, endpoint, request_count, window_start) VALUES (?, ?, ?, 1, NOW())',
    [generateId('rate'), userId, endpoint]
  )
  
  return true
}

// Enhanced ID generator
function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`
}