import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import TaskCard from '../TaskCard'
import { mockTask, mockUser } from '@/test/utils'

describe('TaskCard Component', () => {
  const defaultProps = {
    task: mockTask,
    userRole: 'STUDENT' as const,
    currentUserId: 'user_123',
  }

  it('should render task information correctly', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('Learn React Hooks')).toBeInTheDocument()
    expect(screen.getByText('Master useState and useEffect')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('TODO')).toBeInTheDocument()
  })

  it('should show edit and delete buttons for task creator', () => {
    const props = {
      ...defaultProps,
      currentUserId: 'educator_123', // Same as task.creatorId
    }

    render(<TaskCard {...props} />)

    expect(screen.getByTitle('Edit task')).toBeInTheDocument()
    expect(screen.getByTitle('Delete task')).toBeInTheDocument()
  })

  it('should not show edit and delete buttons for non-creator', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.queryByTitle('Edit task')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete task')).not.toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    const props = {
      ...defaultProps,
      currentUserId: 'educator_123',
      onEdit,
    }

    render(<TaskCard {...props} />)

    fireEvent.click(screen.getByTitle('Edit task'))
    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('should call onDelete when delete is confirmed', () => {
    const onDelete = vi.fn()
    const props = {
      ...defaultProps,
      currentUserId: 'educator_123',
      onDelete,
    }

    render(<TaskCard {...props} />)

    // Click delete button
    fireEvent.click(screen.getByTitle('Delete task'))
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete Task'))
    expect(onDelete).toHaveBeenCalledWith('task_123')
  })

  it('should show progress update section for students', () => {
    render(<TaskCard {...defaultProps} />)

    // Expand the card first
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    expect(screen.getByText('Update Progress')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument()
  })

  it('should call onProgressUpdate when progress is updated', () => {
    const onProgressUpdate = vi.fn()
    const props = {
      ...defaultProps,
      onProgressUpdate,
    }

    render(<TaskCard {...props} />)

    // Expand the card
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    // Enter progress value
    const progressInput = screen.getByPlaceholderText('0')
    fireEvent.change(progressInput, { target: { value: '75' } })

    // Click update button
    fireEvent.click(screen.getByText('Update Progress'))

    expect(onProgressUpdate).toHaveBeenCalledWith('task_123', 75)
  })

  it('should call onAIBreakdown when AI breakdown button is clicked', () => {
    const onAIBreakdown = vi.fn()
    const props = {
      ...defaultProps,
      onAIBreakdown,
    }

    render(<TaskCard {...props} />)

    fireEvent.click(screen.getByText('🚀 AI Breakdown'))
    expect(onAIBreakdown).toHaveBeenCalledWith('task_123')
  })

  it('should display tags correctly', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('should show due date information', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument()
  })

  it('should show estimated time', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText('2 hours')).toBeInTheDocument()
  })
})