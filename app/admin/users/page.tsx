'use client'

import { useEffect, useState } from 'react'

interface User {
  username: string
  email?: string
  createdAt: string
  lastLoginAt?: string
  points: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<string | null>(null)
  const [editPoints, setEditPoints] = useState(0)
  const [saving, setSaving] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    fetch('/api/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSavePoints = async (username: string) => {
    setSaving(true)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, points: editPoints }),
      credentials: 'include',
    })
    setSaving(false)
    setEditUser(null)
    fetchUsers()
  }

  const handleDelete = async (username: string) => {
    if (!confirm(`确定要删除用户「${username}」吗？此操作不可恢复。`)) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
      credentials: 'include',
    })
    fetchUsers()
  }

  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleDateString('zh-CN') : '—'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {users.length} 名注册用户</p>
        </div>
        <button
          onClick={fetchUsers}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          刷新
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">加载中…</div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-400">
          暂无注册用户
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['用户名', '邮箱', '注册时间', '最后登录', '积分', '操作'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.username} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.username}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(user.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(user.lastLoginAt)}</td>
                  <td className="px-4 py-3">
                    {editUser === user.username ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editPoints}
                          onChange={e => setEditPoints(Number(e.target.value))}
                          className="w-20 rounded border border-gray-200 px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => handleSavePoints(user.username)}
                          disabled={saving}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditUser(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-orange-600">{user.points}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setEditUser(user.username); setEditPoints(user.points) }}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        调整积分
                      </button>
                      <button
                        onClick={() => handleDelete(user.username)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        删除
                      </button>
                    </div>
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
