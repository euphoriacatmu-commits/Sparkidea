import { NextRequest, NextResponse } from 'next/server'
import { parseSessionId } from '@/lib/auth-utils'
import { getSession, getUsers, saveUsers } from '@/lib/data-store'

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

  const users = getUsers().map(u => ({
    username: u.username,
    email: u.email,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    points: u.points,
  }))

  return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { username, points } = await req.json()
  const users = getUsers()
  const idx = users.findIndex(u => u.username === username)
  if (idx === -1) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  if (typeof points === 'number') {
    users[idx].points = points
  }
  saveUsers(users)

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { username } = await req.json()
  const users = getUsers().filter(u => u.username !== username)
  saveUsers(users)

  return NextResponse.json({ ok: true })
}
