import { NextRequest, NextResponse } from 'next/server'
import { buildPlanningPrompt } from '@/lib/prompts/planning'
import { callCompletion, getModelId } from '@/lib/api-client'
import { DEFAULT_SETTINGS } from '@/lib/model-config'
import type { ProjectConfig, IdeationCard, SeriesPlan } from '@/lib/types'
import type { ModelSettings } from '@/lib/model-config'

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
      maxTokens: 8000,
      messages: [{ role: 'user', content: buildPlanningPrompt(config, ideation) }],
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[planning] No JSON in response:', text.slice(0, 200))
      return NextResponse.json({ error: '规划生成失败，请重试' }, { status: 500 })
    }

    const plan: SeriesPlan = JSON.parse(jsonMatch[0])
    if (!plan.projectId) plan.projectId = `proj_${Date.now()}`

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('[planning] error:', error)
    const msg = error instanceof Error ? error.message : '规划生成失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
