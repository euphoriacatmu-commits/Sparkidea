'use client'

import { useState } from 'react'
import type { IdeationCard } from '@/lib/types'

interface IdeationCardsProps {
  cards: IdeationCard[]
  onSelect: (card: IdeationCard) => void
}

const EMOTION_LABELS: Record<string, { label: string; color: string }> = {
  love: { label: '爱', color: 'bg-pink-100 text-pink-700' },
  hate: { label: '恨', color: 'bg-red-100 text-red-700' },
  fear: { label: '恐惧', color: 'bg-purple-100 text-purple-700' },
  resentment: { label: '不甘', color: 'bg-orange-100 text-orange-700' },
}

export default function IdeationCards({ cards, onSelect }: IdeationCardsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (card: IdeationCard) => {
    setSelectedId(card.id)
    onSelect(card)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const emotion = EMOTION_LABELS[card.coreEmotion] || { label: card.coreEmotion, color: 'bg-gray-100 text-gray-700' }
        const isSelected = selectedId === card.id

        return (
          <div
            key={card.id}
            className={`group relative flex flex-col gap-3 rounded-2xl border p-5 transition cursor-pointer
              ${isSelected
                ? 'border-spark-400 bg-spark-50 shadow-md ring-2 ring-spark-200'
                : 'border-gray-200 bg-white hover:border-spark-300 hover:shadow-md'
              }
            `}
            onClick={() => handleSelect(card)}
          >
            {/* 潜力标记 */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-gray-900 leading-snug">
                {card.title}
              </h3>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${card.potential === 'high' ? 'bg-spark-100 text-spark-700' : 'bg-gray-100 text-gray-500'}`}>
                {card.potential === 'high' ? '🔥 高潜力' : '⭐ 中潜力'}
              </span>
            </div>

            {/* 一句话故事 */}
            <p className="text-sm text-gray-600 leading-relaxed">{card.logline}</p>

            {/* 情绪标签 */}
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${emotion.color}`}>
                核心情绪：{emotion.label}
              </span>
              {card.trafficBase && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  {card.trafficBase}
                </span>
              )}
            </div>

            {/* 展开详情（悬停或选中时显示） */}
            <div className={`flex flex-col gap-2 border-t border-gray-100 pt-3 transition-all
              ${isSelected ? 'block' : 'hidden group-hover:block'}
            `}>
              {card.hook && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">核心钩子</span>
                  <p className="mt-0.5 text-xs text-gray-600">{card.hook}</p>
                </div>
              )}
              {card.eraEmotion && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">时代情绪</span>
                  <p className="mt-0.5 text-xs text-gray-600">{card.eraEmotion}</p>
                </div>
              )}
              {card.potentialReason && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">潜力判断</span>
                  <p className="mt-0.5 text-xs text-gray-600">{card.potentialReason}</p>
                </div>
              )}
            </div>

            {/* 选择按钮 */}
            <button
              onClick={(e) => { e.stopPropagation(); handleSelect(card) }}
              className={`mt-auto w-full rounded-lg py-2 text-sm font-semibold transition
                ${isSelected
                  ? 'bg-spark-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-spark-500 hover:text-white'
                }
              `}
            >
              {isSelected ? '✓ 已选择' : '选择此方案 →'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
