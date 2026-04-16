'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('两次密码输入不一致')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email: email || undefined }),
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '注册失败')
        return
      }

      setAuth(false, data.username)
      router.replace('/')
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
            <h1 className="text-2xl font-bold text-gray-900">注册账号</h1>
            <p className="text-sm text-gray-500 mt-2">创建账号，保存您的创作项目</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="3-20 个字符"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  required
                  minLength={3}
                  maxLength={20}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 <span className="text-gray-400 font-normal">（选填）</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="用于找回密码"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码 <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="再次输入密码"
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
                {loading ? '注册中…' : '注册'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              已有账号？{' '}
              <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                直接登录
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            注册即同意
            <Link href="/terms" className="mx-1 text-orange-400 hover:text-orange-500">服务条款</Link>
            和
            <Link href="/privacy" className="mx-1 text-orange-400 hover:text-orange-500">隐私政策</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
