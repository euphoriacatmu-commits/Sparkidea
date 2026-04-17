'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import type { EpisodeOutline } from '@/lib/types'

interface EpisodeSidebarProps {
  currentEpisode: number
}

const NODE_TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-300',
  plot_bomb: 'bg-spark-500',
  major_twist: 'bg-red-500',
  emotional_peak: 'bg-pink-500',
  comedy_peak: 'bg-yellow-400',
}

const NODE_TYPE_LABELS: Record<string, string> = {
  normal: '',
  plot_bomb: '💥',
  major_twist: '🔥',
  emotional_peak: '💔',
  comedy_peak: '😂',
}

export default function EpisodeSidebar({ currentEpisode }: EpisodeSidebarProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const seriesPlan = useProjectStore(s => s.seriesPlan)
  const generatedEpisodeNumbers = useProjectStore(s => s.generatedEpisodeNumbers)
  const streamingEpisodeNumber = useProjectStore(s => s.streamingEpisodeNumber)
  const qualityWarnings = useProjectStore(s => s.qualityWarnings)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || !seriesPlan) return null

  const episodes = seriesPlan.episodes
  const hotEpisodes = new Set(seriesPlan.hotEpisodes || [])
  // 有质量警告时，在最近一集生成的集数上标红点
  const lastGenerated = generatedEpisodeNumbers.length > 0
    ? Math.max(...generatedEpisodeNumbers)
    : -1
  const hasAnyWarnings = qualityWarnings.length > 0

  const navigateTo = (n: number) => {
    router.push(`/episode/${n}`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700">集数导航</h2>
        <p className="text-xs text-gray-400 mt-0.5">共 {episodes.length} 集</p>
      </div>

      <div className="flex-1 overflow-y-auto episode-sidebar">
        {episodes.map((ep: EpisodeOutline) => {
          const isGenerated = generatedEpisodeNumbers.includes(ep.episodeNumber)
          const isStreaming = streamingEpisodeNumber === ep.episodeNumber
          const isCurrent = currentEpisode === ep.episodeNumber
          const isHot = hotEpisodes.has(ep.episodeNumber)
          const hasWarning = hasAnyWarnings && ep.episodeNumber === lastGenerated
          const nodeColor = NODE_TYPE_COLORS[ep.nodeType] || 'bg-gray-300'
          const nodeEmoji = NODE_TYPE_LABELS[ep.nodeType] || ''

          return (
            <button
              key={ep.episodeNumber}
              onClick={() => navigateTo(ep.episodeNumber)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition hover:bg-gray-50
                ${isCurrent ? 'bg-spark-50 border-r-2 border-spark-500' : ''}
              `}
            >
              {/* 状态指示点 */}
              <div className="shrink-0 relative">
                {isStreaming ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-spark-400 animate-pulse-slow" />
                ) : isGenerated ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-spark-500" />
                ) : (
                  <div className={`h-2.5 w-2.5 rounded-full ${nodeColor} opacity-40`} />
                )}
                {hasWarning && (
                  <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </div>

              {/* 集数 + 标题 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-spark-600' : 'text-gray-400'}`}>
                    第{ep.episodeNumber}集
                  </span>
                  {isHot && <span className="text-xs">⚡</span>}
                  {nodeEmoji && <span className="text-xs">{nodeEmoji}</span>}
                </div>
                <p className={`text-xs truncate ${isCurrent ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {ep.title}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
