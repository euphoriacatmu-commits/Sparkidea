'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin', label: '控制台', icon: '📊', exact: true },
  { href: '/admin/users', label: '用户管理', icon: '👥', exact: false },
  { href: '/admin/projects', label: '项目总览', icon: '📁', exact: false },
  { href: '/admin/ai-config', label: 'AI 模型配置', icon: '🤖', exact: false },
  { href: '/admin/settings', label: '网站设置', icon: '⚙️', exact: false },
  { href: '/admin/payments', label: '支付配置', icon: '💳', exact: false },
  { href: '/admin/points', label: '积分管理', icon: '💎', exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAdmin, isChecked, username } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && isChecked && !isAdmin) {
      router.replace('/login?next=/admin')
    }
  }, [mounted, isChecked, isAdmin, router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    useAuthStore.getState().clearAuth()
    router.replace('/login')
  }

  if (!mounted || !isChecked || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">验证权限中…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 侧边栏 */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-sm">火花剧本</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">超级管理员后台</p>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition
                  ${isActive
                    ? 'bg-orange-500 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">当前：{username}</div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-gray-600 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition"
          >
            退出登录
          </button>
          <Link
            href="/"
            className="block text-center mt-2 text-xs text-gray-500 hover:text-gray-300 transition"
          >
            返回主站 →
          </Link>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
