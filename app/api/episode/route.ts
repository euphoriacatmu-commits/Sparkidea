import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildEpisodePrompt } from '@/lib/prompts/episode'
import type { ProjectConfig, SeriesPlan, EpisodeOutline } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  let config: ProjectConfig
  let plan: SeriesPlan
  let episodeOutline: EpisodeOutline
  let previousHook: string | null

  try {
    const body = await req.json()
    config = body.config
    plan = body.plan
    episodeOutline = body.episodeOutline
    previousHook = body.previousHook ?? null

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

  const prompt = buildEpisodePrompt(config, plan, episodeOutline, previousHook)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: 'claude-opus-4-5',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        })

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const data = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('[episode] stream error:', error)
        const errorData = `data: ${JSON.stringify({ error: '生成中断，请重试' })}\n\n`
        controller.enqueue(encoder.encode(errorData))
        controller.close()
      }
    },
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
