import { NextRequest, NextResponse } from 'next/server'
import { parseSessionId } from '@/lib/auth-utils'
import { getSession, getSiteConfig, saveSiteConfig } from '@/lib/data-store'

function requireAdmin(req: NextRequest) {
  const sessionId = parseSessionId(req.headers.get('cookie'))
  if (!sessionId) return null
  const session = getSession(sessionId)
  if (!session || session.role !== 'admin') return null
  return session
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }
  return NextResponse.json(getSiteConfig())
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }
  const body = await req.json()
  saveSiteConfig(body)
  return NextResponse.json({ ok: true })
}
