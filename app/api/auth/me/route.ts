import { NextRequest, NextResponse } from 'next/server'
import { parseSessionId } from '@/lib/auth-utils'
import { getSession } from '@/lib/data-store'

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie')
  const sessionId = parseSessionId(cookieHeader)

  if (!sessionId) {
    return NextResponse.json({ username: null, role: null })
  }

  const session = getSession(sessionId)
  if (!session) {
    return NextResponse.json({ username: null, role: null })
  }

  return NextResponse.json({
    username: session.username,
    role: session.role,
  })
}
