import { vi } from 'vitest'

// Mock Next.js modules
export const mockNextRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

export const mockNextNavigation = {
  useRouter: () => mockNextRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}

// Mock database responses
export const mockDatabaseResponses = {
  userFound: [[{
    id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    email_verified: true,
    role: 'STUDENT',
    created_at: new Date(),
    updated_at: new Date(),
  }]],
  userNotFound: [[]],
  taskCreated: [{ insertId: 1 }],
  tasksFound: [[{
    id: 'task_123',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'HIGH',
    status: 'TODO',
    due_date: new Date(),
    estimated_time: 120,
    actual_time: null,
    tags: JSON.stringify(['test']),
    difficulty_level: 'INTERMEDIATE',
    creator_id: 'educator_123',
    assignee_id: 'user_123',
    parent_task_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    archived_at: null,
  }]],
}

// Mock AI responses
export const mockAIResponses = {
  taskBreakdown: {
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
  },
  progressSummary: {
    overallScore: 85,
    strengths: ['Consistent progress'],
    areasForImprovement: ['Time management'],
    recommendations: ['Set daily goals'],
    motivationalMessage: 'Great work!',
    nextSteps: ['Continue learning'],
  },
  studySuggestions: '• Focus on React fundamentals\n• Practice daily coding',
}

// Mock environment variables for tests
export const mockEnvVars = {
  JWT_SECRET: 'test-jwt-secret',
  DB_HOST: 'localhost',
  DB_USER: 'test',
  DB_PASSWORD: 'test',
  DB_NAME: 'test_db',
  GOOGLE_GENERATIVE_AI_API_KEY: 'test-api-key',
  NODE_ENV: 'test',
}