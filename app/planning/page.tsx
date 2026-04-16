'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import { useModelConfigStore } from '@/store/model-config'
import PlanningMap from '@/components/PlanningMap'
import NavBar from '@/components/NavBar'

export default function PlanningPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = useProjectStore(s => s.config)
  const selectedCard = useProjectStore(s => s.selectedCard)
  const parsedOutline = useProjectStore(s => s.parsedOutline)
  const seriesPlan = useProjectStore(s => s.seriesPlan)
  const { setSeriesPlan, saveCurrentProject } = useProjectStore()
  const { settings: modelSettings } = useModelConfigStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 守卫：如果没有配置则重定向
  useEffect(() => {
    if (mounted && !config) {
      router.replace('/')
    }
  }, [mounted, config, router])

  // 自动生成规划
  useEffect(() => {
    if (mounted && config && !seriesPlan && !isGenerating) {
      generatePlan()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, config])

  const generatePlan = async () => {
    if (!config) return

    // 确定传给规划 API 的 ideation 数据
    const ideation = selectedCard || {
      id: 'from_outline',
      title: parsedOutline?.title || config.title,
      logline: parsedOutline?.synopsis || '',
      coreEmotion: (parsedOutline?.emotionCore as 'love' | 'hate' | 'fear' | 'resentment') || 'love',
      trafficBase: '情感共鸣',
      hook: '开场即冲突',
      eraEmotion: '时代情绪',
      potential: 'high' as const,
      potentialReason: '基于用户大纲生成',
    }

    setIsGenerating(true)
    setError(null)

    let retries = 3
    while (retries > 0) {
      try {
        const res = await fetch('/api/planning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config, ideation, modelSettings }),
        })

        const data = await res.json()

        if (!res.ok || data.error) {
          setError(data.error || '规划生成失败，请重试')
          break
        }

        setSeriesPlan(data.plan)
        saveCurrentProject()
        break
      } catch {
        retries--
        if (retries === 0) {
          setError('网络错误，请重试')
        } else {
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    }

    setIsGenerating(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar backHref="/config" backLabel="返回配置" step={3} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">全集规划</h1>
            <p className="text-sm text-gray-500 mt-1">
              {config && `${config.title} · ${config.totalEpisodes}集 · ${config.episodeDuration}分钟/集`}
            </p>
          </div>
          {seriesPlan && (
            <button
              onClick={generatePlan}
              disabled={isGenerating}
              className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              重新规划
            </button>
          )}
        </div>

        {/* 加载中 */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <svg className="h-12 w-12 animate-spin text-spark-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg">🔥</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">AI 正在规划全集结构…</p>
              <p className="text-sm text-gray-400 mt-1">
                共 {config?.totalEpisodes} 集，正在生成情绪曲线和爆点分布，约需 30 秒
              </p>
            </div>
          </div>
        )}

        {/* 错误 */}
        {error && !isGenerating && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-4 flex flex-col items-center gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={generatePlan}
              className="rounded-lg bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 transition"
            >
              重试
            </button>
          </div>
        )}

        {/* 规划地图 */}
        {seriesPlan && !isGenerating && (
          <PlanningMap plan={seriesPlan} projectTitle={config?.title || ''} />
        )}
      </main>
    </div>
  )
}
