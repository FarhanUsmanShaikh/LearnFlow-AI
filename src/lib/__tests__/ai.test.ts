import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIService } from '../ai'

// Mock the AI SDK
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mocked-model'),
}))

vi.mock('ai', () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
}))

// Mock database functions
vi.mock('../db', () => ({
  db: {
    execute: vi.fn(),
  },
  createAIInsight: vi.fn(),
  getAIInsightsByUser: vi.fn(),
}))

describe('AIService', () => {
  let aiService: AIService

  beforeEach(() => {
    vi.clearAllMocks()
    aiService = AIService.getInstance()
  })

  describe('generateTaskBreakdown', () => {
    it('should generate task breakdown successfully', async () => {
      const { generateObject } = await import('ai')
      const mockBreakdown = {
        subtasks: [
          {
            title: 'Learn useState',
            description: 'Understand state management',
            estimatedTime: 60,
            priority: 'HIGH' as const,
            order: 1,
          },
        ],
        totalEstimatedTime: 60,
        difficulty: 'INTERMEDIATE' as const,
        prerequisites: ['Basic JavaScript'],
      }

      vi.mocked(generateObject).mockResolvedValue({
        object: mockBreakdown,
      })

      const result = await aiService.generateTaskBreakdown(
        'Learn React Hooks',
        'Master useState and useEffect'
      )

      expect(generateObject).toHaveBeenCalledWith({
        model: 'mocked-model',
        schema: expect.any(Object),
        prompt: expect.stringContaining('Learn React Hooks'),
      })

      expect(result).toEqual(mockBreakdown)
    })

    it('should handle AI service errors', async () => {
      const { generateObject } = await import('ai')
      vi.mocked(generateObject).mockRejectedValue(new Error('AI service error'))

      await expect(
        aiService.generateTaskBreakdown('Test Task')
      ).rejects.toThrow('Failed to generate task breakdown')
    })
  })

  describe('generateProgressSummary', () => {
    it('should generate progress summary successfully', async () => {
      const { generateObject } = await import('ai')
      const { db } = await import('../db')

      // Mock database queries
      vi.mocked(db.execute)
        .mockResolvedValueOnce([[]]) // Progress logs query
        .mockResolvedValueOnce([[]]) // Completed tasks query

      const mockSummary = {
        overallScore: 85,
        strengths: ['Consistent progress'],
        areasForImprovement: ['Time management'],
        recommendations: ['Set daily goals'],
        motivationalMessage: 'Great work!',
        nextSteps: ['Continue learning'],
      }

      vi.mocked(generateObject).mockResolvedValue({
        object: mockSummary,
      })

      const result = await aiService.generateProgressSummary('user_123')

      expect(db.execute).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockSummary)
    })
  })

  describe('generateStudySuggestions', () => {
    it('should generate study suggestions successfully', async () => {
      const { generateText } = await import('ai')
      const { db } = await import('../db')

      // Mock database queries
      vi.mocked(db.execute)
        .mockResolvedValueOnce([[]]) // Tasks query
        .mockResolvedValueOnce([[]]) // Progress query

      const mockSuggestions = '• Focus on React fundamentals\n• Practice daily coding'

      vi.mocked(generateText).mockResolvedValue({
        text: mockSuggestions,
      })

      const result = await aiService.generateStudySuggestions('user_123')

      expect(result).toBe(mockSuggestions)
    })
  })

  describe('storeInsight', () => {
    it('should store AI insight successfully', async () => {
      const { createAIInsight } = await import('../db')
      const mockInsight = {
        id: 'insight_123',
        userId: 'user_123',
        taskId: null,
        insightType: 'TASK_BREAKDOWN' as const,
        title: 'Test Insight',
        content: { test: 'data' },
        metadata: null,
        confidenceScore: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      }

      vi.mocked(createAIInsight).mockResolvedValue(mockInsight)

      const result = await aiService.storeInsight(
        'user_123',
        'TASK_BREAKDOWN',
        { test: 'data' },
        null,
        'Test Insight'
      )

      expect(createAIInsight).toHaveBeenCalledWith({
        userId: 'user_123',
        insightType: 'TASK_BREAKDOWN',
        title: 'Test Insight',
        content: { test: 'data' },
        metadata: null,
      })

      expect(result).toEqual(mockInsight)
    })
  })

  describe('getUserInsights', () => {
    it('should retrieve user insights successfully', async () => {
      const { getAIInsightsByUser } = await import('../db')
      const mockInsights = [
        {
          id: 'insight_123',
          userId: 'user_123',
          taskId: null,
          insightType: 'TASK_BREAKDOWN' as const,
          title: 'Test Insight',
          content: { test: 'data' },
          metadata: null,
          confidenceScore: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          archivedAt: null,
        },
      ]

      vi.mocked(getAIInsightsByUser).mockResolvedValue(mockInsights)

      const result = await aiService.getUserInsights('user_123')

      expect(getAIInsightsByUser).toHaveBeenCalledWith('user_123', undefined)
      expect(result).toEqual(mockInsights)
    })
  })
})