import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateSessionId, makeSetCookieHeader } from '@/lib/auth-utils'
import { getUserByUsername, createUser, createSession, getSiteConfig } from '@/lib/data-store'

export async function POST(req: NextRequest) {
  const { username, password, email } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json({ error: '用户名长度需在 3-20 个字符之间' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: '密码长度不能少于 6 位' }, { status: 400 })
  }

  // Check if registration is open
  const siteConfig = getSiteConfig()
  if (!siteConfig.registrationOpen) {
    return NextResponse.json({ error: '当前注册已关闭，请联系管理员' }, { status: 403 })
  }

  // Check username not taken
  if (getUserByUsername(username)) {
    return NextResponse.json({ error: '该用户名已被占用' }, { status: 409 })
  }

  // Don't allow admin username
  const adminUser = process.env.ADMIN_USERNAME || 'admin'
  if (username === adminUser) {
    return NextResponse.json({ error: '该用户名不可用' }, { status: 409 })
  }

  const passwordHash = hashPassword(password)
  createUser(username, passwordHash, email)

  // Auto-login after registration
  const sessionId = generateSessionId()
  createSession(sessionId, username, 'user')

  const res = NextResponse.json({ ok: true, username })
  res.headers.set('Set-Cookie', makeSetCookieHeader(sessionId))
  return res
}
