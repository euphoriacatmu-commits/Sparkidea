'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IdeaInput from '@/components/IdeaInput'
import OutlineUploader from '@/components/OutlineUploader'
import { useProjectStore } from '@/store/project'
import type { IdeationCard, ParsedOutline } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const { setUserInput, setIdeationCards, setParsedOutline, reset } = useProjectStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleIdeaSubmit = async (text: string) => {
    setError(null)
    setIsGenerating(true)
    setUserInput(text)

    let retries = 3
    while (retries > 0) {
      try {
        const res = await fetch('/api/ideation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInput: text }),
        })

        const data = await res.json()

        if (!res.ok || data.error) {
          setError(data.error || '生成失败，请重试')
          break
        }

        const cards: IdeationCard[] = data.cards
        setIdeationCards(cards)
        router.push('/ideation')
        return
      } catch {
        retries--
        if (retries === 0) {
          setError('网络错误，请检查连接后重试')
        } else {
          await new Promise(r => setTimeout(r, 1000))
        }
      }
    }

    setIsGenerating(false)
  }

  const handleOutlineParsed = (outline: ParsedOutline) => {
    setParsedOutline(outline)
    router.push('/config')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-900">火花剧本</span>
            <span className="text-xs text-gray-400 hidden sm:inline">AI漫剧/短剧爆款剧本生成器</span>
          </div>
          <button
            onClick={() => reset()}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            重置项目
          </button>
        </div>
      </header>

      {/* 主体 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* 标题区 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-spark-100 px-4 py-1.5 mb-4">
            <span className="text-spark-600 text-sm font-medium">从一个想法到完整剧本</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            AI 爆款短剧<span className="text-spark-500">剧本生成器</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            支持红果漫剧 · 抖音 · oiioii · TapNow · LibLib 等平台
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 max-w-2xl w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* 两个入口 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* 路径 A：想法输入 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <div>
                <h2 className="text-base font-bold text-gray-900">从想法开始</h2>
                <p className="text-xs text-gray-400">输入关键词，AI 帮你生成选题方案</p>
              </div>
            </div>
            <IdeaInput onSubmit={handleIdeaSubmit} isLoading={isGenerating} />
          </div>

          {/* 路径 B：上传大纲 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <div>
                <h2 className="text-base font-bold text-gray-900">上传已有大纲</h2>
                <p className="text-xs text-gray-400">AI 解析大纲，直接进入配置环节</p>
              </div>
            </div>
            <OutlineUploader onParsed={handleOutlineParsed} />
          </div>
        </div>

        {/* 功能亮点 */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full text-center">
          {[
            { icon: '🎯', text: '5步生成完整剧本' },
            { icon: '📺', text: '支持7大主流平台' },
            { icon: '⚡', text: '流式实时输出' },
            { icon: '📊', text: '质量防劣化检测' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-white border border-gray-100 py-3 px-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs text-gray-600 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </main>

      {/* 底部 */}
      <footer className="py-6 text-center text-xs text-gray-400">
        <p>火花剧本 · 由 Claude Anthropic 驱动</p>
      </footer>
    </div>
  )
}
