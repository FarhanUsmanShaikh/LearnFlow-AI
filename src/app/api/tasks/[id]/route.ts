import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  estimatedTime: z.number().min(1).optional(),
  actualTime: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await auth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task details
    const [taskRows] = await db.execute(
      'SELECT * FROM learning_tasks WHERE id = ? AND archived_at IS NULL',
      [id]
    ) as any[]

    if (taskRows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const taskRow = taskRows[0]

    // Check access permissions
    const hasAccess = 
      taskRow.creator_id === user.id ||
      taskRow.assignee_id === user.id ||
      user.role === 'ADMIN'

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Format task data
    const task = {
      id: taskRow.id,
      title: taskRow.title,
      description: taskRow.description,
      priority: taskRow.priority,
      status: taskRow.status,
      dueDate: taskRow.due_date,
      estimatedTime: taskRow.estimated_time,
      actualTime: taskRow.actual_time,
      tags: taskRow.tags ? (typeof taskRow.tags === 'string' ? JSON.parse(taskRow.tags) : taskRow.tags) : [],
      difficultyLevel: taskRow.difficulty_level,
      creatorId: taskRow.creator_id,
      assigneeId: taskRow.assignee_id,
      parentTaskId: taskRow.parent_task_id,
      createdAt: taskRow.created_at,
      updatedAt: taskRow.updated_at,
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await auth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if task exists and get permissions info
    const [taskRows] = await db.execute(
      'SELECT creator_id, assignee_id FROM learning_tasks WHERE id = ? AND archived_at IS NULL',
      [id]
    ) as any[]

    if (taskRows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = taskRows[0]

    // Check permissions - creator or assignee can update
    const canUpdate = 
      task.creator_id === user.id ||
      task.assignee_id === user.id ||
      user.role === 'ADMIN'

    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // Build update query dynamically based on provided fields
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (validatedData.title !== undefined) {
      updateFields.push('title = ?')
      updateValues.push(validatedData.title)
    }
    if (validatedData.description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(validatedData.description)
    }
    if (validatedData.priority !== undefined) {
      updateFields.push('priority = ?')
      updateValues.push(validatedData.priority)
    }
    if (validatedData.status !== undefined) {
      updateFields.push('status = ?')
      updateValues.push(validatedData.status)
    }
    if (validatedData.dueDate !== undefined) {
      updateFields.push('due_date = ?')
      updateValues.push(validatedData.dueDate ? new Date(validatedData.dueDate) : null)
    }
    if (validatedData.estimatedTime !== undefined) {
      updateFields.push('estimated_time = ?')
      updateValues.push(validatedData.estimatedTime)
    }
    if (validatedData.actualTime !== undefined) {
      updateFields.push('actual_time = ?')
      updateValues.push(validatedData.actualTime)
    }
    if (validatedData.tags !== undefined) {
      updateFields.push('tags = ?')
      updateValues.push(JSON.stringify(validatedData.tags))
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = NOW()')
    updateValues.push(id)

    if (updateFields.length === 1) { // Only updated_at was added
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Execute update
    await db.execute(
      `UPDATE learning_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // Get updated task
    const [updatedRows] = await db.execute(
      'SELECT * FROM learning_tasks WHERE id = ?',
      [id]
    ) as any[]

    const updatedTask = updatedRows[0]
    const formattedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      status: updatedTask.status,
      dueDate: updatedTask.due_date,
      estimatedTime: updatedTask.estimated_time,
      actualTime: updatedTask.actual_time,
      tags: updatedTask.tags ? (typeof updatedTask.tags === 'string' ? JSON.parse(updatedTask.tags) : updatedTask.tags) : [],
      difficultyLevel: updatedTask.difficulty_level,
      creatorId: updatedTask.creator_id,
      assigneeId: updatedTask.assignee_id,
      parentTaskId: updatedTask.parent_task_id,
      createdAt: updatedTask.created_at,
      updatedAt: updatedTask.updated_at,
    }

    return NextResponse.json({ success: true, data: formattedTask })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await auth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if task exists and get creator info
    const [rows] = await db.execute(
      'SELECT creator_id FROM learning_tasks WHERE id = ? AND archived_at IS NULL',
      [id]
    ) as any[]

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = rows[0]

    // Only creator or admin can delete
    const canDelete = 
      task.creator_id === user.id ||
      user.role === 'ADMIN'

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete - set archived_at timestamp
    await db.execute(
      'UPDATE learning_tasks SET archived_at = NOW() WHERE id = ?',
      [id]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}