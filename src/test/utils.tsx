import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock user data for testing
export const mockUser = {
  id: 'user_123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'STUDENT' as const,
  emailVerified: true,
}

export const mockEducator = {
  id: 'educator_123',
  name: 'Test Educator',
  email: 'educator@example.com',
  role: 'EDUCATOR' as const,
  emailVerified: true,
}

// Mock task data
export const mockTask = {
  id: 'task_123',
  title: 'Learn React Hooks',
  description: 'Master useState and useEffect',
  priority: 'HIGH' as const,
  status: 'TODO' as const,
  dueDate: new Date('2024-12-31'),
  estimatedTime: 120,
  actualTime: null,
  tags: ['react', 'javascript'],
  difficultyLevel: 'INTERMEDIATE' as const,
  creatorId: 'educator_123',
  assigneeId: 'user_123',
  parentTaskId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  archivedAt: null,
}

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

export * from '@testing-library/react'
export { customRender as render }