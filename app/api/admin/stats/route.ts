import { NextRequest, NextResponse } from 'next/server'
import { parseSessionId } from '@/lib/auth-utils'
import { getSession, getUsers } from '@/lib/data-store'

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

  const users = getUsers()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const todayUsers = users.filter(u => new Date(u.createdAt) >= today).length
  const monthUsers = users.filter(u => new Date(u.createdAt) >= thisMonth).length
  const activeToday = users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) >= today).length

  return NextResponse.json({
    totalUsers: users.length,
    todayNewUsers: todayUsers,
    monthNewUsers: monthUsers,
    activeToday,
  })
}
