import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { createProgressLog, getProgressLogsByTask, updateTaskStatus } from '@/lib/db'

const progressSchema = z.object({
  progressPercentage: z.number().min(0).max(100),
  notes: z.string().optional(),
  timeSpent: z.number().min(0).optional(),
  completionEvidence: z.string().url().optional(),
})

// POST /api/tasks/[id]/progress - Update task progress
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = progressSchema.parse(body)
    const taskId = id

    // Create progress log
    const progressLog = await createProgressLog({
      taskId,
      userId: user.id,
      ...validatedData,
    })

    // Auto-update task status based on progress
    if (validatedData.progressPercentage === 100) {
      await updateTaskStatus(taskId, 'DONE', user.id)
    } else if (validatedData.progressPercentage > 0) {
      await updateTaskStatus(taskId, 'IN_PROGRESS', user.id)
    }

    return NextResponse.json({
      success: true,
      data: progressLog,
      message: 'Progress updated successfully'
    })
  } catch (error) {
    console.error('Update progress error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// GET /api/tasks/[id]/progress - Get task progress logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = id
    const progressLogs = await getProgressLogsByTask(taskId)

    return NextResponse.json({
      success: true,
      data: progressLogs
    })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}