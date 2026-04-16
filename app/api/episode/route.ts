import { NextRequest } from 'next/server'
import { buildEpisodePrompt } from '@/lib/prompts/episode'
import { streamCompletion, getModelId } from '@/lib/api-client'
import { DEFAULT_SETTINGS } from '@/lib/model-config'
import type { ProjectConfig, SeriesPlan, EpisodeOutline } from '@/lib/types'
import type { ModelSettings } from '@/lib/model-config'

export async function POST(req: NextRequest) {
  let config: ProjectConfig
  let plan: SeriesPlan
  let episodeOutline: EpisodeOutline
  let previousHook: string | null
  let modelSettings: ModelSettings

  let adoptedSuggestion: string | undefined

  try {
    const body = await req.json()
    config = body.config
    plan = body.plan
    episodeOutline = body.episodeOutline
    previousHook = body.previousHook ?? null
    modelSettings = body.modelSettings ?? DEFAULT_SETTINGS
    adoptedSuggestion = body.adoptedSuggestion ?? undefined

    if (!config || !plan || !episodeOutline) {
      return new Response(
        JSON.stringify({ error: '参数不完整' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({ error: '请求格式错误' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const model = getModelId(modelSettings, 'episode')
  const prompt = buildEpisodePrompt(config, plan, episodeOutline, previousHook, adoptedSuggestion)

  const stream = streamCompletion(modelSettings, {
    model,
    maxTokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
