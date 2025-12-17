import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock mysql2
const mockExecute = vi.fn()
const mockGetConnection = vi.fn()
const mockRelease = vi.fn()

vi.mock('mysql2/promise', () => ({
  createPool: vi.fn(() => ({
    execute: mockExecute,
    getConnection: vi.fn(() => Promise.resolve({
      release: mockRelease
    }))
  }))
}))

// Import after mocking
import { testConnection, findUserByEmail, createUser } from '../db'

describe('Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const mockConnection = { release: mockRelease }
      mockGetConnection.mockResolvedValue(mockConnection)

      const result = await testConnection()

      expect(result).toBe(true)
      expect(mockRelease).toHaveBeenCalled()
    })

    it('should return false for failed connection', async () => {
      mockGetConnection.mockRejectedValue(new Error('Connection failed'))

      const result = await testConnection()

      expect(result).toBe(false)
    })
  })

  describe('findUserByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        email_verified: true,
        role: 'STUDENT',
        created_at: new Date(),
        updated_at: new Date()
      }

      mockExecute.mockResolvedValue([[mockUser]])

      const result = await findUserByEmail('test@example.com')

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com']
      )
      expect(result).toEqual({
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        emailVerified: true,
        role: 'STUDENT',
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at
      })
    })

    it('should return null when user not found', async () => {
      mockExecute.mockResolvedValue([[]])

      const result = await findUserByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'hashed_password',
        role: 'STUDENT' as const
      }

      mockExecute.mockResolvedValue([{ insertId: 1 }])

      const result = await createUser(userData)

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          expect.any(String), // id
          userData.name,
          userData.email,
          userData.password,
          false, // email_verified
          userData.role,
          expect.any(Date), // created_at
          expect.any(Date)  // updated_at
        ])
      )

      expect(result).toEqual({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        emailVerified: false,
        role: userData.role,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })
})