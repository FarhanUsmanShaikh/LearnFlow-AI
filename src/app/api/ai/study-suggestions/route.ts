import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { aiService } from '@/lib/ai-service'
import { findTasksByUser } from '@/lib/db'

// POST /api/ai/study-suggestions - Generate AI study suggestions
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current tasks for the user
    const currentTasks = await findTasksByUser(user.id, user.role, {
      limit: 20,
      includeArchived: false
    })

    // Generate AI study suggestions
    const suggestions = await aiService.generateStudySuggestions(
      user.id,
      user.role,
      currentTasks
    )

    return NextResponse.json({
      success: true,
      data: suggestions,
      message: 'Study suggestions generated successfully',
      metadata: {
        tasksAnalyzed: currentTasks.length,
        userRole: user.role
      }
    })
  } catch (error) {
    console.error('AI Study Suggestions Error:', error)
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate study suggestions' },
      { status: 500 }
    )
  }
}