import { NextRequest, NextResponse } from 'next/server'
import { parseSessionId, makeClearCookieHeader } from '@/lib/auth-utils'
import { deleteSession } from '@/lib/data-store'

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie')
  const sessionId = parseSessionId(cookieHeader)

  if (sessionId) {
    deleteSession(sessionId)
  }

  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', makeClearCookieHeader())
  return res
}
