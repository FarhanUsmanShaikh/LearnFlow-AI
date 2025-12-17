"use client"

import { useState, useEffect } from 'react'
import { z } from 'zod'
import type { LearningTask } from '@/lib/db'

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskUpdated: () => void
  task: LearningTask | null
}

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.number().min(1).max(10080).optional(),
  tags: z.array(z.string()).optional(),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
})

export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED',
    dueDate: '',
    estimatedTime: '',
    tags: '',
    difficultyLevel: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        estimatedTime: task.estimatedTime?.toString() || '',
        tags: task.tags ? task.tags.join(', ') : '',
        difficultyLevel: task.difficultyLevel || 'INTERMEDIATE',
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setIsSubmitting(true)
    setError('')

    try {
      // Prepare data - only include changed fields
      const submitData: any = {}
      
      if (formData.title !== task.title) {
        submitData.title = formData.title
      }
      if (formData.description !== (task.description || '')) {
        submitData.description = formData.description || undefined
      }
      if (formData.priority !== task.priority) {
        submitData.priority = formData.priority
      }
      if (formData.status !== task.status) {
        submitData.status = formData.status
      }
      
      const newDueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      const currentDueDate = task.dueDate ? new Date(task.dueDate).toISOString() : null
      if (newDueDate !== currentDueDate) {
        submitData.dueDate = newDueDate
      }
      
      const newEstimatedTime = formData.estimatedTime ? Number(formData.estimatedTime) : undefined
      if (newEstimatedTime !== task.estimatedTime) {
        submitData.estimatedTime = newEstimatedTime
      }
      
      const newTags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      const currentTags = task.tags || []
      if (JSON.stringify(newTags) !== JSON.stringify(currentTags)) {
        submitData.tags = newTags
      }

      // Only submit if there are changes
      if (Object.keys(submitData).length === 0) {
        setError('No changes detected')
        return
      }

      // Validate
      updateTaskSchema.parse(submitData)

      // Submit
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (result.success) {
        onTaskUpdated()
        onClose()
      } else {
        setError(result.error || 'Failed to update task')
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else {
        setError('Failed to update task')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-slide-up mx-4 sm:mx-6 lg:mx-8">
        <div className="p-6 sm:p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
                <p className="text-sm text-gray-500">Update task details and settings</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-slide-up">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto">
            {/* Title */}
            <div className="space-y-3 px-2">
              <label className="form-label flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                placeholder="e.g., Learn React Hooks and State Management"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-3 px-2">
              <label className="form-label flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="form-input resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                placeholder="Provide detailed instructions, learning objectives, and any resources students should use..."
              />
            </div>

            {/* Status and Priority */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Task Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                <div className="space-y-3">
                  <label className="form-label flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="form-input focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
                  >
                    <option value="TODO">📋 To Do</option>
                    <option value="IN_PROGRESS">⏳ In Progress</option>
                    <option value="DONE">✅ Done</option>
                    <option value="CANCELLED">❌ Cancelled</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="form-label flex items-center">
                    <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="form-input focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
                  >
                    <option value="LOW">🟢 Low Priority</option>
                    <option value="MEDIUM">🟡 Medium Priority</option>
                    <option value="HIGH">🟠 High Priority</option>
                    <option value="URGENT">🔴 Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Due Date and Estimated Time */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scheduling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                <div className="space-y-3">
                  <label className="form-label flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="form-input focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
                  />
                </div>

                <div className="space-y-3">
                  <label className="form-label flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    className="form-input focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                    placeholder="e.g., 120 (2 hours)"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help students plan their time effectively
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Organization
              </h3>
              <div className="space-y-3 px-2">
                <label className="form-label flex items-center">
                  <svg className="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="form-input focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full"
                  placeholder="e.g., javascript, react, frontend, programming"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Separate multiple tags with commas to help organize and filter tasks
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary hover-lift order-2 sm:order-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary hover-lift order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Updating Task...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Task
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}