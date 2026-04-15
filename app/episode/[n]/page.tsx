'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import EpisodeSidebar from '@/components/EpisodeSidebar'
import EpisodeEditor from '@/components/EpisodeEditor'

interface EpisodePageProps {
  params: { n: string }
}

export default function EpisodePage({ params }: EpisodePageProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const episodeNumber = parseInt(params.n, 10)

  const seriesPlan = useProjectStore(s => s.seriesPlan)
  const config = useProjectStore(s => s.config)
  const { setCurrentEpisodeNumber } = useProjectStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && (!config || !seriesPlan)) {
      router.replace('/')
    }
  }, [mounted, config, seriesPlan, router])

  useEffect(() => {
    if (mounted && !isNaN(episodeNumber)) {
      setCurrentEpisodeNumber(episodeNumber)
    }
  }, [mounted, episodeNumber, setCurrentEpisodeNumber])

  if (!mounted) return null
  if (isNaN(episodeNumber) || episodeNumber < 1) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        集数参数无效
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 导航栏 */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push('/planning')}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            ← 规划图
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-900">火花剧本</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-auto text-xs text-gray-400">
            <span>① 选题策划</span>
            <span>→</span>
            <span>② 项目配置</span>
            <span>→</span>
            <span>③ 全集规划</span>
            <span>→</span>
            <span className="text-spark-600 font-semibold">④ 逐集生成</span>
          </div>
          <div className="sm:hidden text-xs text-spark-600 font-semibold ml-auto">
            第{episodeNumber}集
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-screen-xl mx-auto w-full">
        {/* 左侧：集数导航 */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-gray-100 bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
          <EpisodeSidebar currentEpisode={episodeNumber} />
        </aside>

        {/* 右侧：编辑区 */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">
          <EpisodeEditor episodeNumber={episodeNumber} />
        </main>
      </div>
    </div>
  )
}
