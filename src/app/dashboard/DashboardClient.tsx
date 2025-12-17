"use client"

import { useState, useEffect } from 'react'
import SignOutButton from "@/components/SignOutButton"
import TaskCard from "@/components/TaskCard"
import CreateTaskModal from "@/components/CreateTaskModal"
import EditTaskModal from "@/components/EditTaskModal"
import WelcomeModal from "@/components/WelcomeModal"
import AIResultModal from "@/components/AIResultModal"
import type { AuthUser } from '@/lib/auth'
import type { LearningTask } from '@/lib/db'

interface DashboardClientProps {
  user: AuthUser
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [tasks, setTasks] = useState<LearningTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<LearningTask | null>(null)
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'progress' | 'done'>('all')
  
  // Welcome Modal State
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  
  // AI Result Modal State
  const [aiResultModal, setAiResultModal] = useState<{
    isOpen: boolean
    title: string
    content: any
    type: 'task-breakdown' | 'progress-summary' | 'general'
  }>({
    isOpen: false,
    title: '',
    content: null,
    type: 'general'
  })

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const result = await response.json()
      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch AI insights
  const fetchAIInsights = async () => {
    try {
      const response = await fetch('/api/ai/insights')
      const result = await response.json()
      if (result.success) {
        setAiInsights(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchAIInsights()
    
    // Check if we should show welcome modal
    if (typeof window !== 'undefined') {
      const shouldShowWelcome = sessionStorage.getItem('showWelcome')
      if (shouldShowWelcome === 'true') {
        setShowWelcomeModal(true)
        sessionStorage.removeItem('showWelcome')
      }
    }
  }, [])

  // Handle progress update
  const handleProgressUpdate = async (taskId: string, progress: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressPercentage: progress,
          notes: `Progress updated to ${progress}%`,
        }),
      })

      const result = await response.json()
      if (result.success) {
        // Refresh tasks to show updated status
        fetchTasks()
      } else {
        alert('Failed to update progress: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
      alert('Failed to update progress')
    }
  }

  // Handle AI breakdown
  const handleAIBreakdown = async (taskId: string) => {
    setIsGeneratingInsight(true)
    try {
      const response = await fetch('/api/ai/task-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })

      const result = await response.json()
      if (result.success) {
        // Show AI result in modal instead of alert
        setAiResultModal({
          isOpen: true,
          title: 'AI Task Breakdown',
          content: result.data,
          type: 'task-breakdown'
        })
        fetchAIInsights()
      } else {
        setAiResultModal({
          isOpen: true,
          title: 'Error',
          content: 'Failed to generate AI breakdown: ' + result.error,
          type: 'general'
        })
      }
    } catch (error) {
      console.error('Failed to generate AI breakdown:', error)
      setAiResultModal({
        isOpen: true,
        title: 'Error',
        content: 'Failed to generate AI breakdown. Please try again.',
        type: 'general'
      })
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  // Handle task edit
  const handleEditTask = (task: LearningTask) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  // Handle task delete
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        // Refresh tasks list
        fetchTasks()
        setAiResultModal({
          isOpen: true,
          title: 'Success',
          content: 'Task deleted successfully!',
          type: 'general'
        })
      } else {
        setAiResultModal({
          isOpen: true,
          title: 'Error',
          content: 'Failed to delete task: ' + result.error,
          type: 'general'
        })
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      setAiResultModal({
        isOpen: true,
        title: 'Error',
        content: 'Failed to delete task. Please try again.',
        type: 'general'
      })
    }
  }

  // Generate progress summary
  const generateProgressSummary = async () => {
    setIsGeneratingInsight(true)
    try {
      const response = await fetch('/api/ai/progress-summary', {
        method: 'POST',
      })

      const result = await response.json()
      if (result.success) {
        // Show AI result in modal instead of alert
        setAiResultModal({
          isOpen: true,
          title: 'AI Progress Summary',
          content: result.data,
          type: 'progress-summary'
        })
        fetchAIInsights()
      } else {
        setAiResultModal({
          isOpen: true,
          title: 'Error',
          content: 'Failed to generate progress summary: ' + result.error,
          type: 'general'
        })
      }
    } catch (error) {
      console.error('Failed to generate progress summary:', error)
      setAiResultModal({
        isOpen: true,
        title: 'Error',
        content: 'Failed to generate progress summary. Please try again.',
        type: 'general'
      })
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  const completedTasks = tasks.filter(task => task.status === 'DONE').length
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length
  const todoTasks = tasks.filter(task => task.status === 'TODO').length

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    switch (activeTab) {
      case 'todo': return task.status === 'TODO'
      case 'progress': return task.status === 'IN_PROGRESS'
      case 'done': return task.status === 'DONE'
      default: return true
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LearnFlow AI - AI Learning Platform
                </h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                {user.role === 'EDUCATOR' && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn btn-primary btn-sm hover-lift"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Task
                  </button>
                )}
                
                <button
                  onClick={generateProgressSummary}
                  disabled={isGeneratingInsight}
                  className="btn btn-secondary btn-sm hover-lift"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isGeneratingInsight ? 'Generating...' : 'AI Summary'}
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-600">
                {user.role === 'EDUCATOR' 
                  ? "Manage your learning tasks and track student progress" 
                  : "Continue your learning journey with AI-powered insights"
                }
              </p>
            </div>
            
            {/* Mobile Actions */}
            <div className="md:hidden">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover-lift animate-fade-in group">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All learning tasks</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift animate-fade-in group" style={{animationDelay: '0.1s'}}>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{inProgressTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">Active learning</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift animate-fade-in group" style={{animationDelay: '0.2s'}}>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift animate-fade-in group" style={{animationDelay: '0.3s'}}>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">AI Insights</p>
                  <p className="text-3xl font-bold text-gray-900">{aiInsights.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Generated insights</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          <div className="xl:col-span-2">
            {/* Tasks Header with Tabs */}
            <div className="card mb-6">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.role === 'EDUCATOR' ? 'Created Tasks' : 'Learning Tasks'}
                  </h2>
                  
                  {/* Task Filter Tabs */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {[
                      { key: 'all', label: 'All', count: tasks.length },
                      { key: 'todo', label: 'To Do', count: todoTasks },
                      { key: 'progress', label: 'In Progress', count: inProgressTasks },
                      { key: 'done', label: 'Done', count: completedTasks }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.key
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            {isLoading ? (
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading tasks...</p>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'all' ? 'No tasks found' : `No ${activeTab} tasks`}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {user.role === 'EDUCATOR' 
                      ? 'Create your first learning task to get started'
                      : 'Your educator will assign tasks for you to complete'
                    }
                  </p>
                  {user.role === 'EDUCATOR' && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="btn btn-primary hover-lift"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create First Task
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task, index) => (
                  <div key={task.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <TaskCard
                      task={task}
                      onProgressUpdate={user.role === 'STUDENT' ? handleProgressUpdate : undefined}
                      onAIBreakdown={handleAIBreakdown}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      userRole={user.role}
                      currentUserId={user.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            {/* AI Actions Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Assistant
                </h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  onClick={generateProgressSummary}
                  disabled={isGeneratingInsight}
                  className="w-full btn btn-primary hover-lift"
                >
                  {isGeneratingInsight ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Generate Progress Summary
                    </div>
                  )}
                </button>
                
                <div className="text-xs text-gray-500 text-center">
                  Get AI-powered insights about your learning progress and recommendations for improvement.
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Recent Insights</h3>
              </div>
              <div className="card-body">
                {aiInsights.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">No AI insights yet</p>
                    <p className="text-xs text-gray-400">Use AI features to generate personalized insights</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiInsights.slice(0, 5).map((insight, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{insight.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {insight.insightType.replace('_', ' ').toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    
                    {aiInsights.length > 5 && (
                      <div className="text-center pt-2">
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          View all insights ({aiInsights.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-semibold text-green-600">
                    {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{todoTasks}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{inProgressTasks}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
          fetchTasks()
          setIsCreateModalOpen(false)
        }}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTask(null)
        }}
        onTaskUpdated={() => {
          fetchTasks()
          setIsEditModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user.name || 'User'}
        userRole={user.role}
      />

      {/* AI Result Modal */}
      <AIResultModal
        isOpen={aiResultModal.isOpen}
        onClose={() => setAiResultModal(prev => ({ ...prev, isOpen: false }))}
        title={aiResultModal.title}
        content={aiResultModal.content}
        type={aiResultModal.type}
      />

      {/* Enhanced Footer */}
      <footer className="mt-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-bold">AI Learning Platform</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering learners with AI-driven insights and intelligent task management.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Dashboard</li>
                <li>Tasks</li>
                <li>AI Insights</li>
                <li>Progress Tracking</li>
              </ul>
            </div>

            {/* Developer */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Developer</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">FU</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Farhan Usman Shaikh</p>
                  <p className="text-xs text-gray-400">Full Stack Developer</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <a 
                  href="https://github.com/FarhanUsmanShaikh" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/in/farhan-usman-shaikh" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 AI Learning Platform. Built with Next.js 16, TypeScript, MySQL, and Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}