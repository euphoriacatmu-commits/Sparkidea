import { NextRequest, NextResponse } from 'next/server'
import { buildPlanningPrompt } from '@/lib/prompts/planning'
import { callCompletion, getModelId } from '@/lib/api-client'
import { DEFAULT_SETTINGS } from '@/lib/model-config'
import type { ProjectConfig, IdeationCard, SeriesPlan } from '@/lib/types'
import type { ModelSettings } from '@/lib/model-config'

/** 尝试修复被截断的 JSON（episodes 数组未完整时） */
function tryRepairJSON(raw: string): SeriesPlan | null {
  // 逐字符追踪嵌套深度，找到 depth===1 时的最后一个完整子项结束位置
  let depth = 0
  let inStr = false
  let esc = false
  let lastDepth1Close = -1

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (esc) { esc = false; continue }
    if (c === '\\' && inStr) { esc = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (c === '{' || c === '[') depth++
    if (c === '}' || c === ']') {
      depth--
      if (depth === 1) lastDepth1Close = i
    }
  }

  if (lastDepth1Close < 0) return null

  // 尝试几种闭合方式
  const bases = [
    raw.slice(0, lastDepth1Close + 1),
    raw.slice(0, lastDepth1Close + 1).replace(/,\s*$/, ''),
  ]
  const suffixes = [']}', '}', ']}}}', '}}']

  for (const base of bases) {
    for (const suffix of suffixes) {
      try {
        const parsed = JSON.parse(base + suffix)
        if (parsed && typeof parsed === 'object') return parsed as SeriesPlan
      } catch { /* continue */ }
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { config, ideation, modelSettings } = body as {
      config: ProjectConfig
      ideation: IdeationCard
      modelSettings?: ModelSettings
    }

    if (!config || !ideation) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const settings = modelSettings ?? DEFAULT_SETTINGS
    const model = getModelId(settings, 'planning')

    const { text } = await callCompletion(settings, {
      model,
      maxTokens: 12000,
      messages: [{ role: 'user', content: buildPlanningPrompt(config, ideation) }],
    })

    // 提取 JSON 文本（取最外层 { } 之间的内容）
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[planning] No JSON in response:', text.slice(0, 300))
      return NextResponse.json({ error: '规划生成失败，请重试' }, { status: 500 })
    }

    let plan: SeriesPlan
    try {
      plan = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      console.warn('[planning] JSON parse failed, trying repair...', String(parseErr).slice(0, 100))
      const repaired = tryRepairJSON(jsonMatch[0])
      if (!repaired) {
        console.error('[planning] Repair failed. Raw tail:', jsonMatch[0].slice(-200))
        return NextResponse.json({ error: '规划解析失败（输出过长被截断），请减少集数后重试，或点击重试' }, { status: 500 })
      }
      plan = repaired
    }

    if (!plan.projectId) plan.projectId = `proj_${Date.now()}`
    // 确保必要字段存在
    if (!Array.isArray(plan.episodes)) plan.episodes = []
    if (!Array.isArray(plan.acts)) plan.acts = []
    if (!Array.isArray(plan.characters)) plan.characters = []
    if (!Array.isArray(plan.plotBombs)) plan.plotBombs = []
    if (!Array.isArray(plan.hotEpisodes)) plan.hotEpisodes = []

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('[planning] error:', error)
    const msg = error instanceof Error ? error.message : '规划生成失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
