import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.DB_HOST = 'localhost'
process.env.DB_USER = 'test'
process.env.DB_PASSWORD = 'test'
process.env.DB_NAME = 'test_db'
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-api-key'

// Cleanup after each test
afterEach(() => {
  cleanup()
})