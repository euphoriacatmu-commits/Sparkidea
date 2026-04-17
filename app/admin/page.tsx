'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalUsers: number
  todayNewUsers: number
  monthNewUsers: number
  activeToday: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: '注册用户总数', value: stats.totalUsers, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: '👥' },
    { label: '今日新增用户', value: stats.todayNewUsers, color: 'bg-green-50 border-green-200 text-green-700', icon: '✨' },
    { label: '本月新增用户', value: stats.monthNewUsers, color: 'bg-orange-50 border-orange-200 text-orange-700', icon: '📈' },
    { label: '今日活跃用户', value: stats.activeToday, color: 'bg-purple-50 border-purple-200 text-purple-700', icon: '🔥' },
  ] : []

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">控制台</h1>
      <p className="text-sm text-gray-500 mb-8">火花剧本运营数据概览</p>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          加载中…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {cards.map((card, i) => (
            <div key={i} className={`rounded-2xl border p-6 ${card.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-sm font-medium">{card.label}</span>
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">快捷操作</h2>
          <div className="flex flex-col gap-2">
            {[
              { href: '/admin/users', label: '查看所有用户', icon: '👥' },
              { href: '/admin/ai-config', label: '配置 AI 模型', icon: '🤖' },
              { href: '/admin/settings', label: '网站设置', icon: '⚙️' },
              { href: '/admin/points', label: '调整用户积分', icon: '💎' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:border-orange-200 transition"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto text-gray-300">→</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">系统信息</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">版本</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">数据存储</span>
              <span className="font-medium">本地 JSON 文件</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">运行时间</span>
              <span className="font-medium">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500">超管账号</span>
              <span className="font-medium text-orange-600">{process.env.ADMIN_USERNAME || '（未配置）'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
