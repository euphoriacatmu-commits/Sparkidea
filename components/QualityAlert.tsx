'use client'

import { useState } from 'react'
import type { QualityWarning } from '@/lib/types'
import { showToast } from './Toast'

interface QualityAlertProps {
  warnings: QualityWarning[]
  onAdoptSuggestion?: (suggestion: string, message: string) => void
}

export default function QualityAlert({ warnings, onAdoptSuggestion }: QualityAlertProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  if (!warnings || warnings.length === 0) return null

  const visible = warnings.filter((_, i) => !dismissed.has(i))
  if (visible.length === 0) return null

  const dismiss = (index: number) => {
    setDismissed(prev => new Set(Array.from(prev).concat(index)))
  }

  return (
    <div className="flex flex-col gap-2">
      {warnings.map((warning, i) => {
        if (dismissed.has(i)) return null

        const isError = warning.severity === 'error'

        return (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm
              ${isError
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
              }
            `}
          >
            <span className="text-base shrink-0 mt-0.5">
              {isError ? '🚨' : '⚠️'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{warning.message}</p>
              <p className={`mt-0.5 text-xs ${isError ? 'text-red-600' : 'text-yellow-600'}`}>
                建议：{warning.suggestion}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onAdoptSuggestion && (
                <button
                  onClick={() => {
                    showToast('已采纳建议，正在重新生成', 'info')
                    dismiss(i)
                    onAdoptSuggestion(warning.suggestion, warning.message)
                  }}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition
                    ${isError
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                >
                  采纳建议
                </button>
              )}
              <button
                onClick={() => dismiss(i)}
                className={`shrink-0 rounded-full p-1 transition hover:bg-black/10`}
                title="忽略此提示"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
