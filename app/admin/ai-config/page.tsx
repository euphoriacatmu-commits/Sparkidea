'use client'

import { useState } from 'react'
import ModelConfigPanel from '@/components/ModelConfigPanel'

export default function AdminAIConfigPage() {
  const [showPanel, setShowPanel] = useState(false)

  return (
    <div className="p-8">
      {showPanel && <ModelConfigPanel onClose={() => setShowPanel(false)} />}

      <h1 className="text-2xl font-bold text-gray-900 mb-2">AI 模型配置</h1>
      <p className="text-sm text-gray-500 mb-8">配置 AI 大模型接入参数（仅超级管理员可见）</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">当前模型配置</h2>
          <p className="text-sm text-gray-500 mb-4">
            AI 模型配置存储在管理员本地。点击下方按钮打开配置面板进行修改。
          </p>
          <button
            onClick={() => setShowPanel(true)}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            🤖 打开模型配置面板
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">支持的 AI 服务商</h2>
          <div className="flex flex-col gap-3 text-sm">
            {[
              { icon: '🤖', name: 'Anthropic Claude', desc: 'claude-opus / claude-sonnet / claude-haiku' },
              { icon: '🔀', name: 'OpenRouter', desc: '聚合多家大模型，支持国内访问' },
              { icon: '🌋', name: '火山引擎 ARK', desc: '字节跳动云服务，低延迟高并发' },
            ].map(p => (
              <div key={p.name} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <p className="font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-amber-800 mb-2">环境变量配置（推荐）</h2>
          <p className="text-sm text-amber-700 mb-3">
            在生产环境中，建议通过服务器环境变量配置 API Key，更安全：
          </p>
          <div className="rounded-lg bg-amber-900/10 border border-amber-300 p-4 font-mono text-xs text-amber-900 space-y-1">
            <div>ANTHROPIC_API_KEY=sk-ant-xxx</div>
            <div>ADMIN_USERNAME=your_admin_name</div>
            <div>ADMIN_PASSWORD=your_secure_password</div>
            <div>SESSION_SECRET=random_32_char_string</div>
          </div>
        </div>
      </div>
    </div>
  )
}
