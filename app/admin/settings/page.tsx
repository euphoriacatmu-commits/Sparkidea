'use client'

import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'

interface SiteConfig {
  siteName: string
  announcement: string
  registrationOpen: boolean
  pointsPerEpisode: number
  defaultPoints: number
  paymentEnabled: boolean
  paymentNote: string
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig>({
    siteName: '火花剧本',
    announcement: '',
    registrationOpen: true,
    pointsPerEpisode: 10,
    defaultPoints: 100,
    paymentEnabled: false,
    paymentNote: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        credentials: 'include',
      })
      if (res.ok) {
        showToast('设置已保存')
      } else {
        showToast('保存失败', 'error')
      }
    } catch {
      showToast('保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-gray-400 text-sm">加载中…</div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">网站设置</h1>
      <p className="text-sm text-gray-500 mb-8">配置网站基本参数和运营设置</p>

      <div className="max-w-2xl flex flex-col gap-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">基本信息</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
              <input
                type="text"
                value={config.siteName}
                onChange={e => setConfig(c => ({ ...c, siteName: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公告栏 <span className="text-gray-400 font-normal">（显示在首页）</span>
              </label>
              <textarea
                value={config.announcement}
                onChange={e => setConfig(c => ({ ...c, announcement: e.target.value }))}
                rows={3}
                placeholder="留空则不显示"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 注册与积分 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">注册与积分</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">开放用户注册</p>
                <p className="text-xs text-gray-400 mt-0.5">关闭后新用户无法注册</p>
              </div>
              <button
                onClick={() => setConfig(c => ({ ...c, registrationOpen: !c.registrationOpen }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                  ${config.registrationOpen ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition
                  ${config.registrationOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注册赠送积分</label>
                <input
                  type="number"
                  value={config.defaultPoints}
                  onChange={e => setConfig(c => ({ ...c, defaultPoints: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生成每集消耗积分</label>
                <input
                  type="number"
                  value={config.pointsPerEpisode}
                  onChange={e => setConfig(c => ({ ...c, pointsPerEpisode: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
        >
          {saving ? '保存中…' : '保存设置'}
        </button>
      </div>
    </div>
  )
}
