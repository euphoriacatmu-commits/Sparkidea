import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    if (!fs.existsSync(filePath)) return defaultValue
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDir()
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface StoredUser {
  username: string
  passwordHash: string
  email?: string
  createdAt: string
  lastLoginAt?: string
  points: number
}

export function getUsers(): StoredUser[] {
  return readJSON<StoredUser[]>('users.json', [])
}

export function saveUsers(users: StoredUser[]): void {
  writeJSON('users.json', users)
}

export function getUserByUsername(username: string): StoredUser | undefined {
  return getUsers().find(u => u.username === username)
}

export function createUser(username: string, passwordHash: string, email?: string): StoredUser {
  const users = getUsers()
  const newUser: StoredUser = {
    username,
    passwordHash,
    email,
    createdAt: new Date().toISOString(),
    points: 0,
  }
  users.push(newUser)
  saveUsers(users)
  return newUser
}

export function updateUserLastLogin(username: string): void {
  const users = getUsers()
  const idx = users.findIndex(u => u.username === username)
  if (idx !== -1) {
    users[idx].lastLoginAt = new Date().toISOString()
    saveUsers(users)
  }
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export interface StoredSession {
  sessionId: string
  username: string
  role: 'admin' | 'user'
  createdAt: string
  expiresAt: string
}

export function getSessions(): StoredSession[] {
  return readJSON<StoredSession[]>('sessions.json', [])
}

export function saveSessions(sessions: StoredSession[]): void {
  writeJSON('sessions.json', sessions)
}

export function getSession(sessionId: string): StoredSession | undefined {
  const sessions = getSessions()
  return sessions.find(s => s.sessionId === sessionId && new Date(s.expiresAt) > new Date())
}

export function createSession(sessionId: string, username: string, role: 'admin' | 'user'): StoredSession {
  const sessions = getSessions().filter(s => s.username !== username) // one session per user
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  const session: StoredSession = {
    sessionId,
    username,
    role,
    createdAt: new Date().toISOString(),
    expiresAt,
  }
  sessions.push(session)
  saveSessions(sessions)
  return session
}

export function deleteSession(sessionId: string): void {
  const sessions = getSessions().filter(s => s.sessionId !== sessionId)
  saveSessions(sessions)
}

// ─── Site Config ─────────────────────────────────────────────────────────────

export interface SiteConfig {
  siteName: string
  announcement: string
  registrationOpen: boolean
  pointsPerEpisode: number
  defaultPoints: number
  paymentEnabled: boolean
  paymentNote: string
  updatedAt: string
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: '火花剧本',
  announcement: '',
  registrationOpen: true,
  pointsPerEpisode: 10,
  defaultPoints: 100,
  paymentEnabled: false,
  paymentNote: '',
  updatedAt: new Date().toISOString(),
}

export function getSiteConfig(): SiteConfig {
  return readJSON<SiteConfig>('site-config.json', DEFAULT_SITE_CONFIG)
}

export function saveSiteConfig(config: Partial<SiteConfig>): void {
  const current = getSiteConfig()
  writeJSON('site-config.json', { ...current, ...config, updatedAt: new Date().toISOString() })
}
