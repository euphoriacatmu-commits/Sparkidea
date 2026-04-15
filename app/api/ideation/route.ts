import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildIdeationPrompt } from '@/lib/prompts/ideation'
import type { IdeationCard } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json()

    if (!userInput?.trim()) {
      return NextResponse.json({ error: '请输入创作方向' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: buildIdeationPrompt(userInput.trim()),
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // 提取 JSON 数组（Claude 可能在 markdown 代码块中包裹）
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('[ideation] No JSON found in response:', text.slice(0, 200))
      return NextResponse.json({ error: '解析失败，请重试' }, { status: 500 })
    }

    const cards: IdeationCard[] = JSON.parse(jsonMatch[0])
    return NextResponse.json({ cards })
  } catch (error) {
    console.error('[ideation] error:', error)
    return NextResponse.json(
      { error: '生成失败，请检查网络后重试' },
      { status: 500 }
    )
  }
}
