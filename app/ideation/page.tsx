'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import IdeationCards from '@/components/IdeationCards'
import type { IdeationCard } from '@/lib/types'

export default function IdeationPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const ideationCards = useProjectStore(s => s.ideationCards)
  const userInput = useProjectStore(s => s.userInput)
  const { setSelectedCard } = useProjectStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && ideationCards.length === 0) {
      router.replace('/')
    }
  }, [mounted, ideationCards.length, router])

  if (!mounted) return null

  const handleSelect = (card: IdeationCard) => {
    setSelectedCard(card)
    router.push('/config')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 导航栏 */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            ← 返回
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-900">火花剧本</span>
          </div>
          {/* 步骤进度 */}
          <div className="hidden sm:flex items-center gap-1 ml-auto text-xs text-gray-400">
            <span className="text-spark-600 font-semibold">① 选题策划</span>
            <span>→</span>
            <span>② 项目配置</span>
            <span>→</span>
            <span>③ 全集规划</span>
            <span>→</span>
            <span>④ 逐集生成</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">选择你的选题方案</h1>
          {userInput && (
            <p className="mt-1 text-sm text-gray-500">
              基于「{userInput}」生成了 {ideationCards.length} 个方案
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">点击卡片查看详情，选择最有潜力的方向</p>
        </div>

        {/* 选题卡片 */}
        <IdeationCards cards={ideationCards} onSelect={handleSelect} />
      </main>
    </div>
  )
}
