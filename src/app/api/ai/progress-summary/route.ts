import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { aiService } from '@/lib/ai-service'
import { findTasksByUser, db } from '@/lib/db'

// POST /api/ai/progress-summary - Generate AI progress summary
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent tasks (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTasks = await findTasksByUser(user.id, user.role, {
      limit: 50,
      includeArchived: false
    })

    // Get recent progress logs
    const [progressRows] = await db.execute(
      `SELECT * FROM progress_logs 
       WHERE user_id = ? AND created_at >= ? AND archived_at IS NULL 
       ORDER BY created_at DESC LIMIT 50`,
      [user.id, thirtyDaysAgo]
    ) as any[]

    const progressLogs = progressRows.map((row: any) => ({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      progressPercentage: row.progress,
      notes: row.notes,
      timeSpent: row.time_spent,
      completionEvidence: null, // Not in current schema
      createdAt: row.created_at,
      updatedAt: row.created_at, // Use created_at since no updated_at column
      archivedAt: row.archived_at,
    }))

    // Generate AI summary
    const summary = await aiService.generateProgressSummary(user.id, recentTasks, progressLogs)

    return NextResponse.json({
      success: true,
      data: summary,
      message: 'Progress summary generated successfully',
      metadata: {
        tasksAnalyzed: recentTasks.length,
        progressLogsAnalyzed: progressLogs.length,
        periodDays: 30
      }
    })
  } catch (error) {
    console.error('AI Progress Summary Error:', error)
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate progress summary' },
      { status: 500 }
    )
  }
}