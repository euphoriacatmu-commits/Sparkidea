'use client'

import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'

interface User {
  username: string
  email?: string
  points: number
  createdAt: string
  lastLoginAt?: string
}

export default function AdminPointsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [addAmount, setAddAmount] = useState(50)
  const [saving, setSaving] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    fetch('/api/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleBatchAdd = async () => {
    if (selected.length === 0) { showToast('请先选择用户', 'error'); return }
    setSaving(true)
    try {
      await Promise.all(selected.map(username => {
        const user = users.find(u => u.username === username)
        return fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, points: (user?.points || 0) + addAmount }),
          credentials: 'include',
        })
      }))
      showToast(`已为 ${selected.length} 名用户增加 ${addAmount} 积分`)
      setSelected([])
      fetchUsers()
    } catch {
      showToast('操作失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleSelect = (username: string) => {
    setSelected(s => s.includes(username) ? s.filter(u => u !== username) : [...s, username])
  }

  const toggleAll = () => {
    setSelected(s => s.length === users.length ? [] : users.map(u => u.username))
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">积分管理</h1>
      <p className="text-sm text-gray-500 mb-6">为用户充值或调整积分余额</p>

      {/* 批量操作 */}
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 mb-6 flex flex-wrap items-center gap-4">
        <span className="text-sm text-orange-700 font-medium">
          已选 {selected.length} 人
        </span>
        <div className="flex items-center gap-2">
          <label className="text-sm text-orange-700">增加积分：</label>
          <input
            type="number"
            value={addAmount}
            onChange={e => setAddAmount(Number(e.target.value))}
            className="w-20 rounded-lg border border-orange-300 px-2 py-1 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <button
          onClick={handleBatchAdd}
          disabled={saving || selected.length === 0}
          className="rounded-xl bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50"
        >
          {saving ? '处理中…' : '批量充值'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">加载中…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === users.length && users.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                {['用户名', '邮箱', '当前积分', '注册时间', '上次登录'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr
                  key={user.username}
                  className={`hover:bg-gray-50 transition cursor-pointer ${selected.includes(user.username) ? 'bg-orange-50' : ''}`}
                  onClick={() => toggleSelect(user.username)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(user.username)}
                      onChange={() => toggleSelect(user.username)}
                      onClick={e => e.stopPropagation()}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{user.username}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email || '—'}</td>
                  <td className="px-4 py-3 font-bold text-orange-600">{user.points}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('zh-CN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
