import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the auth functions
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

// Mock the database functions
vi.mock('@/lib/db', () => ({
  createLearningTask: vi.fn(),
  findTasksByUser: vi.fn(),
  updateTaskStatus: vi.fn(),
  createProgressLog: vi.fn(),
}))

describe('Tasks API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/tasks', () => {
    it('should return tasks for authenticated user', async () => {
      const { getCurrentUser } = await import('@/lib/auth')
      const { findTasksByUser } = await import('@/lib/db')

      vi.mocked(getCurrentUser).mockResolvedValue({
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'STUDENT',
        emailVerified: true,
      })

      const mockTasks = [
        {
          id: 'task_123',
          title: 'Test Task',
          description: 'Test Description',
          priority: 'HIGH',
          status: 'TODO',
          dueDate: new Date(),
          estimatedTime: 120,
          actualTime: null,
          tags: ['test'],
          difficultyLevel: 'INTERMEDIATE',
          creatorId: 'educator_123',
          assigneeId: 'user_123',
          parentTaskId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          archivedAt: null,
        },
      ]

      vi.mocked(findTasksByUser).mockResolvedValue(mockTasks)

      const { GET } = await import('../tasks/route')

      const request = new NextRequest('http://localhost:3000/api/tasks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].title).toBe('Test Task')
    })

    it('should return 401 for unauthenticated user', async () => {
      const { getCurrentUser } = await import('@/lib/auth')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const { GET } = await import('../tasks/route')

      const request = new NextRequest('http://localhost:3000/api/tasks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST /api/tasks', () => {
    it('should create task for educator', async () => {
      const { getCurrentUser } = await import('@/lib/auth')
      const { createLearningTask } = await import('@/lib/db')

      vi.mocked(getCurrentUser).mockResolvedValue({
        id: 'educator_123',
        name: 'Test Educator',
        email: 'educator@example.com',
        role: 'EDUCATOR',
        emailVerified: true,
      })

      const mockTask = {
        id: 'task_123',
        title: 'New Task',
        description: 'New Description',
        priority: 'HIGH' as const,
        status: 'TODO' as const,
        dueDate: new Date(),
        estimatedTime: 120,
        actualTime: null,
        tags: ['new'],
        difficultyLevel: 'INTERMEDIATE' as const,
        creatorId: 'educator_123',
        assigneeId: null,
        parentTaskId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      }

      vi.mocked(createLearningTask).mockResolvedValue(mockTask)

      const { POST } = await import('../tasks/route')

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Task',
          description: 'New Description',
          priority: 'HIGH',
          difficultyLevel: 'INTERMEDIATE',
          estimatedTime: 120,
          tags: ['new'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('New Task')
    })

    it('should return 403 for non-educator', async () => {
      const { getCurrentUser } = await import('@/lib/auth')

      vi.mocked(getCurrentUser).mockResolvedValue({
        id: 'user_123',
        name: 'Test Student',
        email: 'student@example.com',
        role: 'STUDENT',
        emailVerified: true,
      })

      const { POST } = await import('../tasks/route')

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Task',
          description: 'New Description',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Only educators can create tasks')
    })
  })
})