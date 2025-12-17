"use client"

import { useState } from 'react'
import { formatDate, formatDuration, getStatusColor, getPriorityColor, getDifficultyColor, cn } from '@/lib/utils'
import type { LearningTask } from '@/lib/db'

interface TaskCardProps {
  task: LearningTask
  onProgressUpdate?: (taskId: string, progress: number) => void
  onAIBreakdown?: (taskId: string) => void
  onEdit?: (task: LearningTask) => void
  onDelete?: (taskId: string) => void
  userRole: 'STUDENT' | 'EDUCATOR' | 'ADMIN'
  currentUserId: string
}

export default function TaskCard({ task, onProgressUpdate, onAIBreakdown, onEdit, onDelete, userRole, currentUserId }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleProgressUpdate = async () => {
    if (!onProgressUpdate || progressValue < 0 || progressValue > 100) return
    
    setIsUpdatingProgress(true)
    try {
      await onProgressUpdate(task.id, progressValue)
      setProgressValue(0)
    } catch (error) {
      console.error('Failed to update progress:', error)
    } finally {
      setIsUpdatingProgress(false)
    }
  }

  const handleAIBreakdown = () => {
    if (onAIBreakdown) {
      onAIBreakdown(task.id)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }



  const confirmDelete = () => {
    if (onDelete) {
      onDelete(task.id)
    }
    setShowDeleteModal(false)
  }

  // Calculate days until due date
  const daysUntilDue = task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0

  return (
    <div className="card hover-lift hover-glow group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {task.title}
              </h3>
              
              {/* Top Right Actions: Due Date + Edit/Delete Buttons */}
              <div className="flex items-center space-x-2 ml-3">
                {/* Due Date Indicator */}
                {task.dueDate && (
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    isOverdue ? "bg-red-100 text-red-800" :
                    isDueSoon ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {isOverdue ? `${Math.abs(daysUntilDue!)} days overdue` :
                     isDueSoon ? `${daysUntilDue} days left` :
                     daysUntilDue === 0 ? 'Due today' :
                     `${daysUntilDue} days left`}
                  </div>
                )}

                {/* Edit and Delete Buttons - Only for task creators or admins */}
                {(task.creatorId === currentUserId || userRole === 'ADMIN') && (
                  <div className="flex items-center space-x-1">
                    {/* Edit Button */}
                    <button 
                      onClick={handleEdit}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete Button */}
                    <button 
                      onClick={handleDelete}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={cn("badge", getStatusColor(task.status))}>
                <div className="flex items-center">
                  {task.status === 'DONE' && (
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {task.status.replace('_', ' ')}
                </div>
              </span>
              
              <span className={cn("badge", getPriorityColor(task.priority))}>
                <div className="flex items-center">
                  {task.priority === 'URGENT' && (
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {task.priority}
                </div>
              </span>
              
              <span className={cn("badge", getDifficultyColor(task.difficultyLevel))}>
                {task.difficultyLevel}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <svg 
              className={cn("w-5 h-5 transition-transform duration-200", isExpanded && "rotate-180")}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-800 font-semibold uppercase tracking-wide">Due Date</p>
              <p className="text-sm text-gray-900 font-semibold mt-1">
                {task.dueDate ? formatDate(task.dueDate) : 'No date set'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-green-800 font-semibold uppercase tracking-wide">Estimated Time</p>
              <p className="text-sm text-gray-900 font-semibold mt-1">
                {task.estimatedTime ? formatDuration(task.estimatedTime) : 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Always Visible and Prominent */}
        <div className="task-quick-actions flex flex-wrap gap-3 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-800 mb-2 w-full">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold">Quick Actions</span>
          </div>
          
          {/* AI Breakdown - Very Prominent Button */}
          <button
            id="ai-breakdown-button"
            onClick={handleAIBreakdown}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-white rounded-lg shadow-xl hover-lift hover-glow transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700'
            }}
          >
            <svg 
              className="w-5 h-5 mr-2 flex-shrink-0" 
              fill="none" 
              stroke="white" 
              viewBox="0 0 24 24"
              style={{ color: 'white', stroke: 'white' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
            </svg>
            <span style={{ color: 'white', fontWeight: '700' }}>🚀 AI Breakdown</span>
          </button>

          {/* Share Task - Optional additional action */}
          <button className="flex-1 min-w-[100px] btn bg-white text-gray-800 hover:bg-gray-50 hover-lift border-2 border-gray-300 font-semibold">
            <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 pt-6 mt-4 animate-slide-up">
            {task.description && (
              <div className="mb-6">
                <h4 className="flex items-center font-medium text-gray-900 mb-3">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Description
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>
                </div>
              </div>
            )}

            {/* Student Progress Update */}
            {userRole === 'STUDENT' && task.status !== 'DONE' && (
              <div className="space-y-3">
                <h4 className="flex items-center font-semibold text-gray-900">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                  Update Progress
                </h4>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <label className="text-sm font-semibold text-blue-900">Progress:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progressValue}
                        onChange={(e) => setProgressValue(Number(e.target.value))}
                        placeholder="0"
                        className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm font-medium text-blue-700">%</span>
                    </div>
                    <button
                      onClick={handleProgressUpdate}
                      disabled={isUpdatingProgress || progressValue < 0 || progressValue > 100}
                      className="btn btn-primary hover-lift hover-glow"
                    >
                      {isUpdatingProgress ? (
                        <div className="flex items-center">
                          <div className="spinner w-4 h-4 mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Update Progress
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">{task.title}</p>
                <p className="text-sm text-gray-600">Status: {task.status}</p>
                <p className="text-sm text-gray-600">Priority: {task.priority}</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Warning: This will permanently delete the task and all associated progress data.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Delete Task
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}