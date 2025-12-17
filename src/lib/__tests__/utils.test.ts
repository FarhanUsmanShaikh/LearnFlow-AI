import { describe, it, expect } from 'vitest'
import { formatDate, formatDuration, getStatusColor, getPriorityColor, getDifficultyColor, cn } from '../utils'

describe('Utils Functions', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2024-01-15T10:30:00Z'
      const result = formatDate(date)
      expect(result).toBe('Jan 15, 2024')
    })

    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle null date', () => {
      const result = formatDate(null)
      expect(result).toBe('No date')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30 minutes')
      expect(formatDuration(1)).toBe('1 minute')
    })

    it('should format hours correctly', () => {
      expect(formatDuration(60)).toBe('1 hour')
      expect(formatDuration(90)).toBe('1 hour 30 minutes')
      expect(formatDuration(120)).toBe('2 hours')
    })

    it('should handle null duration', () => {
      expect(formatDuration(null)).toBe('Not specified')
    })

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('Not specified')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(getStatusColor('TODO')).toBe('badge-secondary')
      expect(getStatusColor('IN_PROGRESS')).toBe('badge-warning')
      expect(getStatusColor('DONE')).toBe('badge-success')
      expect(getStatusColor('CANCELLED')).toBe('badge-danger')
    })
  })

  describe('getPriorityColor', () => {
    it('should return correct colors for each priority', () => {
      expect(getPriorityColor('LOW')).toBe('badge-secondary')
      expect(getPriorityColor('MEDIUM')).toBe('badge-primary')
      expect(getPriorityColor('HIGH')).toBe('badge-warning')
      expect(getPriorityColor('URGENT')).toBe('badge-danger')
    })
  })

  describe('getDifficultyColor', () => {
    it('should return correct colors for each difficulty', () => {
      expect(getDifficultyColor('BEGINNER')).toBe('badge-success')
      expect(getDifficultyColor('INTERMEDIATE')).toBe('badge-warning')
      expect(getDifficultyColor('ADVANCED')).toBe('badge-danger')
    })
  })

  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('should handle undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })
  })
})