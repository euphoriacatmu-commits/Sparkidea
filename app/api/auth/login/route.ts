import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAdminCredentials,
  verifyPassword,
  generateSessionId,
  makeSetCookieHeader,
} from '@/lib/auth-utils'
import {
  getUserByUsername,
  createSession,
  updateUserLastLogin,
} from '@/lib/data-store'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
  }

  let role: 'admin' | 'user' | null = null

  // Check admin first
  if (verifyAdminCredentials(username, password)) {
    role = 'admin'
  } else {
    // Check registered user
    const user = getUserByUsername(username)
    if (user && verifyPassword(password, user.passwordHash)) {
      role = 'user'
    }
  }

  if (!role) {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }

  const sessionId = generateSessionId()
  createSession(sessionId, username, role)

  if (role === 'user') {
    updateUserLastLogin(username)
  }

  const res = NextResponse.json({ ok: true, role, username })
  res.headers.set('Set-Cookie', makeSetCookieHeader(sessionId))
  return res
}
