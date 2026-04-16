'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useProjectStore } from '@/store/project'
import { useModelConfigStore } from '@/store/model-config'
import QualityAlert from './QualityAlert'
import { showToast } from './Toast'
import type { Episode, EpisodeMetadata, HookType } from '@/lib/types'

interface EpisodeEditorProps {
  episodeNumber: number
}

function parseScriptMetadata(script: string, hookType: HookType): EpisodeMetadata {
  const totalChars = script.replace(/\s/g, '').length

  // 优先读取 AI 在"编剧备注"中自报的实际台词占比，保证与剧本底部数字一致
  const reportedRatioMatch = script.match(/实际台词占比[：:]\s*约?\s*(\d+)%/)
  let dialogueRatio: number

  if (reportedRatioMatch) {
    dialogueRatio = Math.min(0.99, parseInt(reportedRatioMatch[1]) / 100)
  } else {
    // 回退：在剧本正文段落里统计台词字符数 / 有效字符总数
    const bodyMatch = script.match(/---剧本正文---([\s\S]*?)(?=---编剧备注---|$)/)
    const bodyText = bodyMatch ? bodyMatch[1] : script
    const bodyLines = bodyText.split('\n')

    let inDialogue = false
    let dialogueChars = 0
    let meaningfulChars = 0

    for (const line of bodyLines) {
      const t = line.trim()
      if (!t) continue
      // 场景头、淡入淡出、△ 属于场景描述
      if (/^(内景|外景|淡入|淡出|△)/.test(t)) { inDialogue = false; meaningfulChars += t.length; continue }
      // 括号指示行
      if (/^（.*）$/.test(t)) { meaningfulChars += t.length; continue }
      // 角色名行（≤12字，不含空格）
      if (/^[^\s（【]{1,12}(\（[^）]*\）)?$/.test(t) && t.length <= 12) { inDialogue = true; continue }
      // 其余正文行
      meaningfulChars += t.length
      if (inDialogue) dialogueChars += t.length
    }

    dialogueRatio = meaningfulChars > 0
      ? Math.min(0.99, dialogueChars / meaningfulChars)
      : 0.5
  }

  // 提取反转计数
  const twistMatch = script.match(/反转计数[：:]\s*本集共(\d+)个反转/)
  const twistCount = twistMatch ? parseInt(twistMatch[1]) : 0

  // 估计时长（字数/阅读速度）
  const estimatedDuration = Math.max(1, Math.round(totalChars / 200))

  return {
    twistCount,
    dialogueRatio,
    hookType,
    estimatedDuration,
  }
}

export default function EpisodeEditor({ episodeNumber }: EpisodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [localContent, setLocalContent] = useState('')
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [adoptedSuggestion, setAdoptedSuggestion] = useState<string | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  const seriesPlan = useProjectStore(s => s.seriesPlan)
  const config = useProjectStore(s => s.config)
  const episodes = useProjectStore(s => s.episodes)
  const qualityWarnings = useProjectStore(s => s.qualityWarnings)
  const {
    setStreamingEpisodeNumber,
    addEpisode,
    setQualityWarnings,
  } = useProjectStore()
  const { settings: modelSettings } = useModelConfigStore()

  const existingEpisode: Episode | undefined = episodes[episodeNumber]
  const episodeOutline = seriesPlan?.episodes.find(e => e.episodeNumber === episodeNumber)

  // 获取上集末尾钩子
  const previousEpisode = episodes[episodeNumber - 1]
  const previousHook = previousEpisode?.editorNotes?.nextEmotionDebt || null

  const startGeneration = useCallback(async (suggestion?: string) => {
    if (!config || !seriesPlan || !episodeOutline) return
    if (isGenerating) return

    setIsGenerating(true)
    setDone(false)
    setErrorMsg(null)
    setLocalContent('')
    setStreamingEpisodeNumber(episodeNumber)

    abortRef.current = new AbortController()
    let fullContent = ''

    try {
      const res = await fetch('/api/episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          plan: seriesPlan,
          episodeOutline,
          previousHook,
          modelSettings,
          adoptedSuggestion: suggestion,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error('请求失败')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()

          if (data === '[DONE]') {
            setDone(true)
            break
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              setErrorMsg(parsed.error)
              break
            }
            if (parsed.text) {
              fullContent += parsed.text
              setLocalContent(fullContent)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      // 生成完成，保存到 store
      if (fullContent && episodeOutline) {
        const metadata = parseScriptMetadata(fullContent, episodeOutline.hookType)

        // 提取编剧备注
        const nextDebtMatch = fullContent.match(/下集情绪账[：:]([^\n]+)/)
        const cluesMatch = fullContent.match(/本集埋设线索[：:]\s*([\s\S]*?)(?=\n下集|$)/)
        const screenshotsMatch = fullContent.match(/可截图时刻[：:]\s*([\s\S]*?)(?=\n预测弹幕|$)/)
        const danmuMatch = fullContent.match(/预测弹幕词[：:]\s*([\s\S]*?)(?=\n反转|$)/)

        const newEpisode: Episode = {
          episodeNumber,
          title: episodeOutline.title,
          preInfo: {
            lastEmotionState: previousHook || '',
            emotionDebt: episodeOutline.emotionTarget,
            targetReaction: '',
          },
          beats: [],
          script: fullContent,
          editorNotes: {
            cluesPlanted: cluesMatch ? cluesMatch[1].split('\n').filter(Boolean) : [],
            nextEmotionDebt: nextDebtMatch ? nextDebtMatch[1].trim() : '',
            screenshotMoments: screenshotsMatch ? screenshotsMatch[1].split('\n').filter(Boolean) : [],
            predictedDanmu: danmuMatch ? danmuMatch[1].split(/[、，,]/).map(s => s.trim()).filter(Boolean) : [],
          },
          metadata,
        }

        addEpisode(newEpisode)

        // 运行质量检测
        const { checkQuality } = await import('@/lib/quality-checker')
        const allEpisodes = Object.values({ ...episodes, [episodeNumber]: newEpisode })
        const warnings = checkQuality(allEpisodes, config)
        setQualityWarnings(warnings)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setErrorMsg('生成中断，请重试')
      }
    } finally {
      setIsGenerating(false)
      setStreamingEpisodeNumber(null)
    }
  }, [config, seriesPlan, episodeOutline, episodeNumber, previousHook, isGenerating, episodes, addEpisode, setQualityWarnings, setStreamingEpisodeNumber])

  // 自动生成（如果没有已生成的集）
  useEffect(() => {
    if (!existingEpisode && !isGenerating && config && seriesPlan && episodeOutline) {
      startGeneration()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeNumber])

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current && isGenerating) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [localContent, isGenerating])

  const handleExportTxt = () => {
    const content = existingEpisode?.script || localContent
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config?.title || '剧本'}_第${episodeNumber}集.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('已导出 .txt 文件')
  }

  const handleExportDocx = async () => {
    const content = existingEpisode?.script || localContent
    if (!content) return

    try {
      const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx')

      const paragraphs = content.split('\n').map(line => {
        if (line.startsWith('# ')) {
          return new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 })
        } else if (line.startsWith('## ')) {
          return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 })
        } else if (line.startsWith('【') && line.endsWith('】')) {
          return new Paragraph({
            children: [new TextRun({ text: line, bold: true })],
          })
        } else if (line.match(/^[^\s]{1,8}[：:]「/)) {
          // 台词行
          return new Paragraph({
            children: [new TextRun({ text: line, bold: false })],
            indent: { left: 360 },
          })
        } else {
          return new Paragraph({ text: line })
        }
      })

      const doc = new Document({
        sections: [{ children: paragraphs }],
        creator: '火花剧本',
        title: `${config?.title || '剧本'} 第${episodeNumber}集`,
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${config?.title || '剧本'}_第${episodeNumber}集.docx`
      a.click()
      URL.revokeObjectURL(url)
      showToast('已导出 .docx 文件')
    } catch (err) {
      console.error('导出 docx 失败:', err)
      alert('导出失败，请使用 TXT 格式')
    }
  }

  const handleExportMd = () => {
    const content = existingEpisode?.script || localContent
    if (!content) return
    let md = `# ${config?.title || '剧本'} · 第${episodeNumber}集\n\n`
    md += content
      .replace(/^(内景|外景)(.+)/gm, '## $1$2')
      .replace(/^(淡入|淡出)$/gm, '*$1*')
      .replace(/^△$/gm, '---')
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config?.title || '剧本'}_第${episodeNumber}集.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast('已导出 .md 文件')
  }

  const handleRegenerate = (suggestion?: string) => {
    setLocalContent('')
    setDone(false)
    setErrorMsg(null)
    showToast('正在重新生成…', 'info')
    startGeneration(suggestion)
  }

  const handleAdoptSuggestion = (suggestion: string) => {
    setAdoptedSuggestion(suggestion)
    handleRegenerate(suggestion)
  }

  const displayContent = existingEpisode?.script || localContent
  const isShowingCached = !!existingEpisode && !isGenerating

  // 渲染剧本正文区域（国际标准格式）
  const renderScriptBody = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, idx) => {
      const trimmed = line.trim()

      // 场景头 内景/外景
      if (/^(内景|外景)/.test(trimmed)) {
        return (
          <div key={idx} className="mt-4 mb-1 font-bold text-gray-900 border-b border-gray-300 pb-1 text-sm uppercase tracking-wide">
            {trimmed}
          </div>
        )
      }

      // 淡入/淡出
      if (/^(淡入|淡出)$/.test(trimmed)) {
        return (
          <div key={idx} className="text-right italic text-gray-500 text-xs my-2">
            {trimmed}
          </div>
        )
      }

      // 场景切换 △
      if (trimmed === '△') {
        return (
          <div key={idx} className="text-center text-gray-400 text-base my-2 select-none">
            △
          </div>
        )
      }

      // 括号指示 （...）
      if (/^（/.test(trimmed) && trimmed.endsWith('）')) {
        return (
          <div key={idx} className="pl-8 text-gray-400 text-xs italic leading-relaxed">
            {trimmed}
          </div>
        )
      }

      // 角色名行：短行（≤12字）不含空格，后面可以跟 (OS)/(VO)/(CONT'D)
      if (/^[^\s（\n【]{1,12}(\s+\((OS|VO|CONT'D)\))?$/.test(trimmed) && trimmed.length > 0) {
        const osMatch = trimmed.match(/\((OS|VO)\)/)
        return (
          <div key={idx} className="mt-3 mb-0 font-bold text-gray-800 text-sm flex items-center gap-2">
            <span>{trimmed.replace(/\s+\((OS|VO|CONT'D)\)/, '')}</span>
            {osMatch && (
              <span className={`text-xs rounded px-1 py-0.5 font-normal
                ${osMatch[1] === 'OS' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {osMatch[1]}
              </span>
            )}
          </div>
        )
      }

      // 空行
      if (trimmed === '') {
        return <div key={idx} className="h-2" />
      }

      // 普通动作/台词行
      return (
        <div key={idx} className="text-sm text-gray-800 leading-loose">
          {line}
        </div>
      )
    })
  }

  // 渲染脚本内容（区分不同段落类型）
  const renderScript = (text: string) => {
    const sections = text.split(/(?=---[^-])/g)
    return sections.map((section, i) => {
      if (section.startsWith('---集前情报---')) {
        return (
          <div key={i} className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-4">
            <h3 className="text-xs font-bold text-blue-500 uppercase mb-2">集前情报</h3>
            <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans leading-relaxed">
              {section.replace('---集前情报---', '').trim()}
            </pre>
          </div>
        )
      } else if (section.startsWith('---节拍时间线---')) {
        return (
          <div key={i} className="rounded-lg bg-yellow-50 border border-yellow-100 p-4 mb-4">
            <h3 className="text-xs font-bold text-yellow-600 uppercase mb-2">节拍时间线</h3>
            <pre className="text-sm text-yellow-800 whitespace-pre-wrap font-sans leading-relaxed">
              {section.replace('---节拍时间线---', '').trim()}
            </pre>
          </div>
        )
      } else if (section.startsWith('---剧本正文---')) {
        const bodyText = section.replace('---剧本正文---', '').trim()
        return (
          <div key={i} className="mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">剧本正文</h3>
            <div className="script-content font-sans">
              {renderScriptBody(bodyText)}
            </div>
          </div>
        )
      } else if (section.startsWith('---编剧备注---')) {
        return (
          <div key={i} className="rounded-lg bg-green-50 border border-green-100 p-4 mt-4">
            <h3 className="text-xs font-bold text-green-600 uppercase mb-2">编剧备注</h3>
            <pre className="text-sm text-green-800 whitespace-pre-wrap font-sans leading-relaxed">
              {section.replace('---编剧备注---', '').trim()}
            </pre>
          </div>
        )
      }
      return (
        <pre key={i} className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
          {section}
        </pre>
      )
    })
  }

  if (!episodeOutline) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        未找到第 {episodeNumber} 集的规划数据
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 质量警告 */}
      <QualityAlert warnings={qualityWarnings} onAdoptSuggestion={handleAdoptSuggestion} />

      {/* 集标题栏 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            第 {episodeNumber} 集 · {episodeOutline.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{episodeOutline.synopsis}</p>
        </div>
        {(isShowingCached || done) && (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={handleExportTxt}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              导出 .txt
            </button>
            <button
              onClick={handleExportDocx}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              导出 .docx
            </button>
            <button
              onClick={handleExportMd}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              导出 .md
            </button>
            <button
              onClick={() => handleRegenerate(adoptedSuggestion)}
              className="rounded-lg border border-spark-200 bg-spark-50 px-3 py-1.5 text-xs font-medium text-spark-600 hover:bg-spark-100 transition"
            >
              重新生成
            </button>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <span>❌</span>
          <span>{errorMsg}</span>
          <button
            onClick={() => handleRegenerate()}
            className="ml-auto text-red-500 underline"
          >
            重试
          </button>
        </div>
      )}

      {/* 剧本内容区 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        style={{ minHeight: '400px' }}
      >
        {isGenerating && !localContent && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
            <svg className="h-8 w-8 animate-spin text-spark-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">AI 正在创作第 {episodeNumber} 集剧本…</p>
          </div>
        )}

        {displayContent && (isShowingCached ? renderScript(displayContent) : (
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-loose">
            {displayContent}
            {isGenerating && <span className="inline-block w-0.5 h-4 bg-spark-500 animate-pulse ml-0.5 align-middle" />}
          </pre>
        ))}
      </div>

      {/* 底部导航 */}
      {(done || isShowingCached) && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={() => episodeNumber > 1 && (window.location.href = `/episode/${episodeNumber - 1}`)}
            disabled={episodeNumber <= 1}
            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 transition"
          >
            ← 上一集
          </button>
          <span className="text-xs text-gray-400">
            {episodeNumber} / {seriesPlan?.episodes.length || '?'}
          </span>
          <button
            onClick={() => {
              const total = seriesPlan?.episodes.length || 0
              if (episodeNumber < total) window.location.href = `/episode/${episodeNumber + 1}`
            }}
            disabled={episodeNumber >= (seriesPlan?.episodes.length || 0)}
            className="text-sm text-spark-600 hover:text-spark-700 font-medium disabled:opacity-30 transition"
          >
            下一集 →
          </button>
        </div>
      )}
    </div>
  )
}
