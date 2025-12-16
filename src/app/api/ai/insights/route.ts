import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getAIInsightsByUser } from '@/lib/db'

// GET /api/ai/insights - Get user's AI insights
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as any

    const insights = await getAIInsightsByUser(user.id, type)

    return NextResponse.json({
      success: true,
      data: insights
    })
  } catch (error) {
    console.error('Get AI insights error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI insights' },
      { status: 500 }
    )
  }
}