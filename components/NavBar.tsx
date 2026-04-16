'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ModelConfigPanel from './ModelConfigPanel'
import { useModelConfigStore } from '@/store/model-config'
import { PROVIDER_INFO } from '@/lib/model-config'

interface NavBarProps {
  backHref?: string
  backLabel?: string
  step?: 1 | 2 | 3 | 4
}

const STEPS = ['① 选题策划', '② 项目配置', '③ 全集规划', '④ 逐集生成']

export default function NavBar({ backHref, backLabel, step }: NavBarProps) {
  const router = useRouter()
  const [showConfig, setShowConfig] = useState(false)
  const { settings } = useModelConfigStore()

  return (
    <>
      {showConfig && <ModelConfigPanel onClose={() => setShowConfig(false)} />}

      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* 返回 */}
          {backHref && (
            <button
              onClick={() => router.push(backHref)}
              className="text-sm text-gray-400 hover:text-gray-600 transition shrink-0"
            >
              ← {backLabel ?? '返回'}
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-900 hidden sm:inline">火花剧本</span>
          </div>

          {/* 步骤进度条 */}
          {step && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 ml-2">
              {STEPS.map((s, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-200">→</span>}
                  <span className={i + 1 === step ? 'text-spark-600 font-semibold' : ''}>
                    {s}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* 右侧：项目频道 + 模型配置按钮 */}
          <div className="ml-auto flex items-center gap-2">
            {/* 项目频道 */}
            <button
              onClick={() => router.push('/projects')}
              className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:border-spark-300 hover:text-spark-600 transition"
              title="项目频道"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              <span>项目</span>
            </button>

            <button
              onClick={() => setShowConfig(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:border-spark-300 hover:text-spark-600 transition"
              title="AI 模型配置"
            >
              <span>
                {settings.provider === 'anthropic' ? '🤖' : settings.provider === 'openrouter' ? '🔀' : '🌋'}
              </span>
              <span className="max-w-[80px] truncate">{PROVIDER_INFO[settings.provider].label}</span>
            </button>
            <button
              onClick={() => setShowConfig(true)}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-spark-600 hover:border-spark-300 transition"
              title="AI 模型配置"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
