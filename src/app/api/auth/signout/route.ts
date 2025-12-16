import { NextResponse } from 'next/server'
import { signOutUser } from '@/lib/auth'

export async function POST() {
  try {
    await signOutUser()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}