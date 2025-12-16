import { google } from '@ai-sdk/google'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { prisma } from './prisma'
import type { LearningTask, ProgressLog, User } from '@prisma/client'

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

      // Fetch user's progress data
      const progressData = await prisma.progressLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          task: {
            select: {
              title: true,
              priority: true,
              status: true,
              estimatedTime: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Get completed tasks in the period
      const completedTasks = await prisma.learningTask.findMany({
        where: {
          assigneeId: userId,
          status: 'DONE',
          updatedAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          title: true,
          priority: true,
          estimatedTime: true,
          actualTime: true,
        },
      })

      const { object } = await generateObject({
        model: google('gemini-1.5-pro'),
        schema: progressAnalysisSchema,
        prompt: `Analyze this student's learning progress and provide insights:
        
        Time Period: ${start.toDateString()} to ${end.toDateString()}
        
        Progress Logs: ${JSON.stringify(progressData, null, 2)}
        Completed Tasks: ${JSON.stringify(completedTasks, null, 2)}
        
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
      // Get user's recent tasks and progress
      const recentTasks = await prisma.learningTask.findMany({
        where: {
          assigneeId: userId,
          archivedAt: null,
        },
        include: {
          progressLogs: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

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
    metadata?: any
  ) {
    try {
      return await prisma.aIInsight.create({
        data: {
          userId,
          type,
          content,
          metadata,
        },
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
      return await prisma.aIInsight.findMany({
        where: {
          userId,
          ...(type && { type: type as any }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
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