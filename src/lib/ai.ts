import { google } from '@ai-sdk/google'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { db, getProgressLogsByTask, createAIInsight, getAIInsightsByUser, type LearningTask, type ProgressLog, type InsightType } from './db'

// AI Response Schemas
const taskBreakdownSchema = z.object({
  subtasks: z.array(z.object({
    title: z.string(),
    description: z.string(),
    estimatedTime: z.number(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    order: z.number(),
  })),
  totalEstimatedTime: z.number(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  prerequisites: z.array(z.string()).optional(),
})

const progressAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  recommendations: z.array(z.string()),
  motivationalMessage: z.string(),
  nextSteps: z.array(z.string()),
})

// AI Service Class
export class AIService {
  private static instance: AIService
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Generate task breakdown using AI
   */
  async generateTaskBreakdown(taskTitle: string, taskDescription?: string) {
    try {
      const { object } = await generateObject({
        model: google('gemini-1.5-pro'),
        schema: taskBreakdownSchema,
        prompt: `Break down this learning task into smaller, manageable subtasks:
        
        Title: ${taskTitle}
        Description: ${taskDescription || 'No description provided'}
        
        Create 3-7 subtasks that are:
        - Specific and actionable learning objectives
        - Properly sequenced (order matters)
        - Include realistic time estimates (in minutes)
        - Have appropriate priority levels
        - Focus on educational outcomes
        
        Consider the learning progression and dependencies between subtasks.
        Estimate the overall difficulty level and any prerequisites needed.`,
      })

      return object
    } catch (error) {
      console.error('AI task breakdown failed:', error)
      throw new Error('Failed to generate task breakdown')
    }
  }

  /**
   * Generate weekly progress summary
   */
  async generateProgressSummary(userId: string, startDate?: Date, endDate?: Date) {
    try {
      // Default to last 7 days if no dates provided
      const end = endDate || new Date()
      const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Fetch user's progress data with task details
      const [progressRows] = await db.execute(`
        SELECT pl.*, lt.title, lt.priority, lt.status, lt.estimated_time
        FROM progress_logs pl
        JOIN learning_tasks lt ON pl.task_id = lt.id
        WHERE pl.user_id = ? AND pl.created_at >= ? AND pl.created_at <= ?
        ORDER BY pl.created_at DESC
      `, [userId, start, end]) as any[]

      // Get completed tasks in the period
      const [completedRows] = await db.execute(`
        SELECT title, priority, estimated_time, actual_time
        FROM learning_tasks
        WHERE assignee_id = ? AND status = 'DONE' AND updated_at >= ? AND updated_at <= ?
      `, [userId, start, end]) as any[]

      const { object } = await generateObject({
        model: google('gemini-1.5-pro'),
        schema: progressAnalysisSchema,
        prompt: `Analyze this student's learning progress and provide insights:
        
        Time Period: ${start.toDateString()} to ${end.toDateString()}
        
        Progress Logs: ${JSON.stringify(progressRows, null, 2)}
        Completed Tasks: ${JSON.stringify(completedRows, null, 2)}
        
        Provide:
        1. Overall progress score (0-100)
        2. Key strengths demonstrated
        3. Areas needing improvement
        4. Specific, actionable recommendations
        5. Motivational feedback
        6. Suggested next steps
        
        Focus on learning patterns, time management, and task completion quality.
        Keep feedback constructive and encouraging.`,
      })

      return object
    } catch (error) {
      console.error('AI progress summary failed:', error)
      throw new Error('Failed to generate progress summary')
    }
  }

  /**
   * Generate smart study suggestions
   */
  async generateStudySuggestions(userId: string) {
    try {
      // Get user's recent tasks
      const [taskRows] = await db.execute(`
        SELECT * FROM learning_tasks
        WHERE assignee_id = ? AND archived_at IS NULL
        ORDER BY created_at DESC
        LIMIT 10
      `, [userId]) as any[]

      // Get recent progress for these tasks
      const taskIds = taskRows.map((task: any) => task.id)
      let progressData: any[] = []
      
      if (taskIds.length > 0) {
        const placeholders = taskIds.map(() => '?').join(',')
        const [progressRows] = await db.execute(`
          SELECT * FROM progress_logs
          WHERE task_id IN (${placeholders})
          ORDER BY created_at DESC
          LIMIT 30
        `, taskIds) as any[]
        progressData = progressRows
      }

      const recentTasks = taskRows.map((task: any) => ({
        ...task,
        progressLogs: progressData.filter((log: any) => log.task_id === task.id).slice(0, 3)
      }))

      const { text } = await generateText({
        model: google('gemini-1.5-pro'),
        prompt: `Based on this student's recent learning tasks and progress, provide personalized study suggestions:
        
        Recent Tasks: ${JSON.stringify(recentTasks, null, 2)}
        
        Provide 5-7 specific study suggestions that:
        - Address current learning gaps
        - Build on existing strengths
        - Suggest optimal study times/methods
        - Recommend resources or techniques
        - Consider task priorities and deadlines
        
        Format as a bulleted list with actionable advice.`,
      })

      return text
    } catch (error) {
      console.error('AI study suggestions failed:', error)
      throw new Error('Failed to generate study suggestions')
    }
  }

  /**
   * Store AI insight in database
   */
  async storeInsight(
    userId: string,
    type: 'TASK_BREAKDOWN' | 'PROGRESS_SUMMARY' | 'STUDY_SUGGESTION' | 'PERFORMANCE_ANALYSIS',
    content: any,
    metadata?: any,
    title: string = 'AI Generated Insight'
  ) {
    try {
      return await createAIInsight({
        userId,
        insightType: type as InsightType,
        title,
        content,
        metadata,
      })
    } catch (error) {
      console.error('Failed to store AI insight:', error)
      throw new Error('Failed to store AI insight')
    }
  }

  /**
   * Get user's AI insights
   */
  async getUserInsights(userId: string, type?: string, limit = 10) {
    try {
      return await getAIInsightsByUser(userId, type as InsightType)
    } catch (error) {
      console.error('Failed to get user insights:', error)
      throw new Error('Failed to get user insights')
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()

// Export types
export type TaskBreakdownResult = z.infer<typeof taskBreakdownSchema>
export type ProgressAnalysisResult = z.infer<typeof progressAnalysisSchema>