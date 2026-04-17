import crypto from 'crypto'

const SESSION_COOKIE = 'spark_session'

// ─── Password hashing ────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = process.env.SESSION_SECRET || 'sparkidea-salt-2026'
  return crypto.createHmac('sha256', salt).update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// ─── Admin credentials (env vars) ────────────────────────────────────────────

export function verifyAdminCredentials(username: string, password: string): boolean {
  const adminUser = process.env.ADMIN_USERNAME || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || 'sparkadmin2026'
  return username === adminUser && password === adminPass
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || 'admin'
}

// ─── Session ID generation ───────────────────────────────────────────────────

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ─── Cookie helpers ──────────────────────────────────────────────────────────

export function getSessionCookieName(): string {
  return SESSION_COOKIE
}

export function makeSetCookieHeader(sessionId: string, maxAgeSeconds = 7 * 24 * 3600): string {
  return `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`
}

export function makeClearCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

// ─── Parse session from request ─────────────────────────────────────────────

export function parseSessionId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))
  return match ? match[1] : null
}
