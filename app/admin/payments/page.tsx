'use client'

import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'

export default function AdminPaymentsPage() {
  const [paymentEnabled, setPaymentEnabled] = useState(false)
  const [paymentNote, setPaymentNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setPaymentEnabled(data.paymentEnabled ?? false)
        setPaymentNote(data.paymentNote ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentEnabled, paymentNote }),
        credentials: 'include',
      })
      if (res.ok) showToast('支付配置已保存')
      else showToast('保存失败', 'error')
    } catch {
      showToast('保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 flex items-center justify-center h-64 text-gray-400 text-sm">加载中…</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">支付配置</h1>
      <p className="text-sm text-gray-500 mb-8">管理付费功能和充值渠道</p>

      <div className="max-w-2xl flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-700">启用付费功能</p>
              <p className="text-xs text-gray-400 mt-0.5">开启后用户可通过充值获取积分</p>
            </div>
            <button
              onClick={() => setPaymentEnabled(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                ${paymentEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition
                ${paymentEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">充值说明 / 联系方式</label>
            <textarea
              value={paymentNote}
              onChange={e => setPaymentNote(e.target.value)}
              rows={4}
              placeholder="例如：请加微信 xxxxxx 进行充值，或扫描下方二维码..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
          <h2 className="text-sm font-bold text-amber-800 mb-2">集成说明</h2>
          <p className="text-sm text-amber-700 leading-relaxed">
            当前支付功能为手动充值模式。如需接入微信支付、支付宝等自动化渠道，
            请联系开发者进行定制对接。
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
        >
          {saving ? '保存中…' : '保存配置'}
        </button>
      </div>
    </div>
  )
}
