import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPlanningPrompt } from '@/lib/prompts/planning'
import type { ProjectConfig, IdeationCard, SeriesPlan } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { config, ideation } = await req.json() as {
      config: ProjectConfig
      ideation: IdeationCard
    }

    if (!config || !ideation) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: buildPlanningPrompt(config, ideation),
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // 提取 JSON 对象
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[planning] No JSON found in response:', text.slice(0, 200))
      return NextResponse.json({ error: '规划生成失败，请重试' }, { status: 500 })
    }

    const plan: SeriesPlan = JSON.parse(jsonMatch[0])

    // 注入 projectId（如果 Claude 没填）
    if (!plan.projectId) {
      plan.projectId = `proj_${Date.now()}`
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('[planning] error:', error)
    return NextResponse.json(
      { error: '规划生成失败，请检查网络后重试' },
      { status: 500 }
    )
  }
}
