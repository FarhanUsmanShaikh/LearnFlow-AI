import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the auth functions
vi.mock('@/lib/auth', () => ({
  signInUser: vi.fn(),
  registerUser: vi.fn(),
}))

// Mock the database
vi.mock('@/lib/db', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/signin', () => {
    it('should sign in user with valid credentials', async () => {
      const { signInUser } = await import('@/lib/auth')
      vi.mocked(signInUser).mockResolvedValue({
        success: true,
        user: {
          id: 'user_123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'STUDENT',
          emailVerified: true,
        },
      })

      // Import the route handler
      const { POST } = await import('../auth/signin/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('test@example.com')
    })

    it('should return error for invalid credentials', async () => {
      const { signInUser } = await import('@/lib/auth')
      vi.mocked(signInUser).mockResolvedValue({
        success: false,
        error: 'Invalid email or password',
      })

      const { POST } = await import('../auth/signin/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid email or password')
    })

    it('should validate request body', async () => {
      const { POST } = await import('../auth/signin/route')

      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.details).toBeDefined()
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const { registerUser } = await import('@/lib/auth')
      vi.mocked(registerUser).mockResolvedValue({
        success: true,
        user: {
          id: 'user_123',
          name: 'New User',
          email: 'new@example.com',
          role: 'STUDENT',
          emailVerified: false,
        },
      })

      const { POST } = await import('../auth/register/route')

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: 'STUDENT',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('new@example.com')
    })

    it('should return error for existing user', async () => {
      const { registerUser } = await import('@/lib/auth')
      vi.mocked(registerUser).mockResolvedValue({
        success: false,
        error: 'User with this email already exists',
      })

      const { POST } = await import('../auth/register/route')

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'STUDENT',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User with this email already exists')
    })
  })
})