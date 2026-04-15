'use client'

import { useState } from 'react'

interface IdeaInputProps {
  onSubmit: (text: string) => void
  isLoading: boolean
}

export default function IdeaInput({ onSubmit, isLoading }: IdeaInputProps) {
  const [value, setValue] = useState('')
  const maxLength = 500

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
        placeholder="输入你的创作灵感…&#10;例如：职场霸总逆袭、甜宠虐心虐的死去活来、悬疑反转层层套娃、穿越古代当暗卫…"
        rows={5}
        disabled={isLoading}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100 disabled:opacity-60"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${value.length > maxLength * 0.9 ? 'text-spark-500' : 'text-gray-400'}`}>
          {value.length} / {maxLength}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-spark-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-spark-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              AI 正在策划中…
            </>
          ) : (
            <>
              <span>✨</span>
              生成选题方案
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400">提示：Ctrl+Enter 快速提交</p>
    </div>
  )
}
