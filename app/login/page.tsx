'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const { setAuth, isLoggedIn } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoggedIn) router.replace(next)
  }, [isLoggedIn, next, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登录失败')
        return
      }

      setAuth(data.role === 'admin', data.username)
      router.replace(data.role === 'admin' ? '/admin' : next)
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 hover:opacity-75 transition-opacity">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-900">火花剧本</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">登录账号</h1>
            <p className="text-sm text-gray-500 mt-2">登录后可保存创作进度</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="输入用户名"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
              >
                {loading ? '登录中…' : '登录'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              还没有账号？{' '}
              <Link href="/register" className="text-orange-500 hover:text-orange-600 font-medium">
                立即注册
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            不登录也可以使用创作功能
            <button onClick={() => router.push('/')} className="ml-1 text-orange-400 hover:text-orange-500">
              直接开始 →
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
