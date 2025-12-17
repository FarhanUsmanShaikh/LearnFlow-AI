import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../auth'

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}))

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn(),
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const bcrypt = await import('bcryptjs')
      const mockHash = 'hashed_password'
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHash)

      const result = await hashPassword('password123')

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(result).toBe(mockHash)
    })
  })

  describe('verifyPassword', () => {
    it('should verify password correctly', async () => {
      const bcrypt = await import('bcryptjs')
      vi.mocked(bcrypt.compare).mockResolvedValue(true)

      const result = await verifyPassword('password123', 'hashed_password')

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password')
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const bcrypt = await import('bcryptjs')
      vi.mocked(bcrypt.compare).mockResolvedValue(false)

      const result = await verifyPassword('wrong_password', 'hashed_password')

      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate JWT token', () => {
      const jwt = require('jsonwebtoken')
      const mockToken = 'jwt_token'
      vi.mocked(jwt.sign).mockReturnValue(mockToken)

      const result = generateToken('user_123')

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user_123' },
        expect.any(String),
        { expiresIn: '7d' }
      )
      expect(result).toBe(mockToken)
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const jwt = require('jsonwebtoken')
      const mockPayload = { userId: 'user_123' }
      vi.mocked(jwt.verify).mockReturnValue(mockPayload)

      const result = verifyToken('valid_token')

      expect(jwt.verify).toHaveBeenCalledWith('valid_token', expect.any(String))
      expect(result).toEqual(mockPayload)
    })

    it('should return null for invalid token', () => {
      const jwt = require('jsonwebtoken')
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = verifyToken('invalid_token')

      expect(result).toBeNull()
    })
  })
})