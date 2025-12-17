import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { aiService } from '@/lib/ai-service'
import { db } from '@/lib/db'

const taskBreakdownSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
})

// POST /api/ai/task-breakdown - Generate AI task breakdown
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId } = taskBreakdownSchema.parse(body)

    // Get the task details with proper access control
    let query: string
    let params: any[]

    if (user.role === 'ADMIN') {
      // Admins can access any task
      query = 'SELECT * FROM learning_tasks WHERE id = ? AND archived_at IS NULL'
      params = [taskId]
    } else if (user.role === 'EDUCATOR') {
      // Educators can access tasks they created
      query = 'SELECT * FROM learning_tasks WHERE id = ? AND creator_id = ? AND archived_at IS NULL'
      params = [taskId, user.id]
    } else {
      // Students can access:
      // 1. Tasks specifically assigned to them
      // 2. Tasks created by educators that are not assigned to anyone (general tasks)
      query = `
        SELECT * FROM learning_tasks 
        WHERE id = ? AND (
          assignee_id = ? OR 
          creator_id = ? OR 
          (assignee_id IS NULL AND creator_id IN (
            SELECT id FROM users WHERE role = 'EDUCATOR'
          ))
        ) AND archived_at IS NULL
      `
      params = [taskId, user.id, user.id]
    }

    const [taskRows] = await db.execute(query, params) as any[]

    if (taskRows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      )
    }

    // Parse tags safely
    let tags = []
    try {
      tags = JSON.parse(taskRows[0].tags || '[]')
    } catch (parseError) {
      console.warn('Failed to parse task tags, using empty array:', parseError)
      tags = []
    }

    const task = {
      id: taskRows[0].id,
      title: taskRows[0].title,
      description: taskRows[0].description,
      priority: taskRows[0].priority,
      status: taskRows[0].status,
      dueDate: taskRows[0].due_date,
      estimatedTime: taskRows[0].estimated_time,
      actualTime: taskRows[0].actual_time,
      tags,
      difficultyLevel: taskRows[0].difficulty_level,
      creatorId: taskRows[0].creator_id,
      assigneeId: taskRows[0].assignee_id,
      parentTaskId: taskRows[0].parent_task_id,
      createdAt: taskRows[0].created_at,
      updatedAt: taskRows[0].updated_at,
      archivedAt: taskRows[0].archived_at,
    }

    // Generate AI breakdown
    const breakdown = await aiService.generateTaskBreakdown(task, user.id)

    return NextResponse.json({
      success: true,
      data: breakdown,
      message: 'Task breakdown generated successfully'
    })
  } catch (error) {
    console.error('AI Task Breakdown Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate task breakdown' },
      { status: 500 }
    )
  }
}