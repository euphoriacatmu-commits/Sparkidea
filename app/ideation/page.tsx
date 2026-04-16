'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import { useModelConfigStore } from '@/store/model-config'
import IdeationCards from '@/components/IdeationCards'
import NavBar from '@/components/NavBar'
import type { IdeationCard } from '@/lib/types'

export default function IdeationPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const ideationCards = useProjectStore(s => s.ideationCards)
  const userInput = useProjectStore(s => s.userInput)
  const { setSelectedCard, appendIdeationCards, reset } = useProjectStore()
  const { settings } = useModelConfigStore()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && ideationCards.length === 0) router.replace('/')
  }, [mounted, ideationCards.length, router])

  if (!mounted) return null

  const handleSelect = (card: IdeationCard) => {
    setSelectedCard(card)
    router.push('/config')
  }

  const handleLoadMore = async () => {
    if (isLoadingMore || ideationCards.length >= 9) return
    setIsLoadingMore(true)
    setLoadMoreError(null)
    try {
      const existingTitles = ideationCards.map(c => c.title)
      const res = await fetch('/api/ideation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          modelSettings: settings,
          count: 3,
          existingTitles,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setLoadMoreError(data.error || '生成失败，请重试')
      } else {
        appendIdeationCards(data.cards as IdeationCard[])
      }
    } catch {
      setLoadMoreError('网络错误，请重试')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleRestart = () => {
    reset()
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar backHref="/" backLabel="返回" step={1} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">选择你的选题方案</h1>
            {userInput && (
              <p className="mt-1 text-sm text-gray-500">
                基于「{userInput}」生成了 {ideationCards.length} 个方案（最多9个）
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">点击卡片查看详情，选择最有潜力的方向</p>
          </div>
          <div className="flex shrink-0 gap-2 mt-1">
            {ideationCards.length < 9 && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-lg border border-spark-200 bg-spark-50 px-3 py-1.5 text-xs font-medium text-spark-600 hover:bg-spark-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? '生成中…' : '+新增3个'}
              </button>
            )}
            <button
              onClick={handleRestart}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              重新开始
            </button>
          </div>
        </div>
        {loadMoreError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {loadMoreError}
          </div>
        )}
        <IdeationCards cards={ideationCards} onSelect={handleSelect} />
      </main>
    </div>
  )
}
