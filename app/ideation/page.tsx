'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import IdeationCards from '@/components/IdeationCards'
import NavBar from '@/components/NavBar'
import type { IdeationCard } from '@/lib/types'

export default function IdeationPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const ideationCards = useProjectStore(s => s.ideationCards)
  const userInput = useProjectStore(s => s.userInput)
  const { setSelectedCard } = useProjectStore()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && ideationCards.length === 0) router.replace('/')
  }, [mounted, ideationCards.length, router])

  if (!mounted) return null

  const handleSelect = (card: IdeationCard) => {
    setSelectedCard(card)
    router.push('/config')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar backHref="/" backLabel="返回" step={1} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">选择你的选题方案</h1>
          {userInput && (
            <p className="mt-1 text-sm text-gray-500">
              基于「{userInput}」生成了 {ideationCards.length} 个方案
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">点击卡片查看详情，选择最有潜力的方向</p>
        </div>
        <IdeationCards cards={ideationCards} onSelect={handleSelect} />
      </main>
    </div>
  )
}
