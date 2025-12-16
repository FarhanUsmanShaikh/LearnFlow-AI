import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { createLearningTask, findTasksByUser } from '@/lib/db'

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  estimatedTime: z.number().min(1).max(10080).optional(), // Max 1 week in minutes
  tags: z.array(z.string()).default([]),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  assigneeId: z.string().optional(),
})

const getTasksSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  includeArchived: z.coerce.boolean().default(false),
})

// GET /api/tasks - Get user's tasks
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = getTasksSchema.parse({
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      includeArchived: searchParams.get('includeArchived') || undefined,
    })

    const tasks = await findTasksByUser(user.id, user.role, {
      status: params.status,
      limit: params.limit,
      offset: params.offset,
      includeArchived: params.includeArchived,
    })

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        limit: params.limit,
        offset: params.offset,
        total: tasks.length, // In a real app, you'd get the total count separately
      }
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only educators can create tasks
    if (user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: 'Only educators can create tasks' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

    const task = await createLearningTask({
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      creatorId: user.id,
    })

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}